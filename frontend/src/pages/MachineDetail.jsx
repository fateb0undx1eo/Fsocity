import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis as BXAxis, YAxis as BYAxis,
  CartesianGrid as BGrid, Tooltip as BTooltip, ResponsiveContainer as BRC, Cell,
} from "recharts";
import Sidebar from "../components/Sidebar";
import DonutChart from "../components/DonutChart";
import { useMachines } from "../context/MachinesContext";
import { useAlerts } from "../context/AlertsContext";
import { useTheme } from "../context/ThemeContext";
import { SENSOR_DOMAINS } from "../components/SensorGraph";
import socket from "../services/socket";
import { computeMaintenanceScore, scoreSeverity, predictNextMaintenance, getConfidence, simulateTicks } from "../services/maintenanceUtils";


// ── Constants ─────────────────────────────────────────────────────────────────
const MAX_HISTORY = 1800;
const TIME_RANGES = { "1h": 3_600_000, "7d": 604_800_000, "30d": 2_592_000_000 };
const SENSOR_UNITS = {
  temperature: "°C", humidity: "%", power: "kW", pressure: "bar",
  gas: "ppm", vibration: "mm/s", current: "A", voltage: "V",
  fuel: "%", rpm: "RPM", cpuTemp: "°C", load: "%",
};
const LINE_COLORS = ["#818cf8", "#34d399", "#fbbf24", "#f87171", "#60a5fa", "#fb923c", "#f472b6", "#a78bfa"];

const COND = {
  Normal: { dot: "#22c55e", pill: "#d1fae5", pillText: "#064e3b" },
  Warning: { dot: "#f59e0b", pill: "#fef3c7", pillText: "#78350f" },
  Critical: { dot: "#ef4444", pill: "#fee2e2", pillText: "#7f1d1d" },
};
const OP_PILL = {
  Active: { bg: "#bbf7d0", color: "#14532d" },
  Idle: { bg: "#fef9c3", color: "#92400e" },
  Off: { bg: "#f3f4f6", color: "#374151" },
};

function normalize(key, value) {
  const [min, max] = SENSOR_DOMAINS[key] ?? [0, 100];
  return parseFloat((((value - min) / (max - min)) * 100).toFixed(2));
}
function fmtRuntime(h) {
  if (h < 0.017) return "0m";
  const hh = Math.floor(h), m = Math.floor((h - hh) * 60);
  return hh > 0 ? `${hh}h ${m}m` : `${m}m`;
}

// Tooltip — defined outside component so it never remounts
function AreaTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(6,4,18,0.97)", border: "1px solid rgba(129,140,248,0.22)",
      borderRadius: 10, padding: "10px 14px", minWidth: 150,
      boxShadow: "0 8px 28px rgba(0,0,0,0.7)", pointerEvents: "none",
    }}>
      <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-body)", marginBottom: 8, fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase" }}>{label}</p>
      {payload.map(p => {
        const raw = p.payload?.[p.dataKey + "_r"];
        const unit = raw !== undefined ? (SENSOR_UNITS[p.dataKey] ?? "") : "%";
        const val = raw !== undefined ? raw.toFixed(1) : p.value?.toFixed(1);
        return (
          <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, boxShadow: `0 0 6px ${p.color}`, flexShrink: 0 }} />
            <span style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body)", fontSize: 10, flex: 1 }}>
              {p.dataKey === "cpuTemp" ? "CPU" : p.dataKey}
            </span>
            <span style={{ color: p.color, fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12 }}>
              {val}<span style={{ fontSize: 9, opacity: 0.6 }}>{unit}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

const BackIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MachineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userMachines, deleteMachine, setMachineName, getOperationalStatus, getRuntimeHours, getMachineName } = useMachines();
  const { checkLimits, getMachineLimits, setMachineLimit, removeMachineLimit } = useAlerts();
  const { colors: c, isDark } = useTheme();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [showLimits, setShowLimits] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const [machine, setMachine] = useState(null);
  const historyRef = useRef([]);
  const [history, setHistory] = useState([]);

  const [selectedSensor, setSelectedSensor] = useState("all");
  const [chartType, setChartType] = useState("pie");
  const [timeRange, setTimeRange] = useState("1h");
  const [activeTab, setActiveTab] = useState("overview"); // overview | analytics | maintenance
  const stressCyclesRef = useRef(0);
  const [stressCycles, setStressCycles] = useState(0);
  const [simResult, setSimResult] = useState(null);
  const [simRunning, setSimRunning] = useState(false);
  const machineStartRef = useRef(Date.now());

  const isUser = String(id).startsWith("user_");
  const userMach = userMachines.find(m => String(m.id) === String(id));

  const pushPoint = useCallback((m) => {
    const now = Date.now();
    const t = new Date(now).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
    const pt = { time: t, ts: now, ...m.sensors };
    historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), pt];
    setHistory([...historyRef.current]);
    setMachine(prev => {
      // Count stress cycle crossings
      if (prev) {
        const WARN = { temperature: 80, pressure: 80, gas: 5, vibration: 20, current: 30, cpuTemp: 75, load: 80 };
        Object.entries(WARN).forEach(([k, thresh]) => {
          const prevVal = prev.sensors?.[k];
          const newVal = m.sensors?.[k];
          if (prevVal !== undefined && newVal !== undefined && prevVal < thresh && newVal >= thresh) {
            stressCyclesRef.current += 1;
            setStressCycles(stressCyclesRef.current);
          }
        });
      }
      return m;
    });
    checkLimits([m]);
  }, [checkLimits]);

  useEffect(() => {
    if (isUser) {
      const t = setInterval(() => { if (userMach) pushPoint(userMach); }, 2000);
      return () => clearInterval(t);
    }
    const h = d => { if (d[id]) pushPoint(d[id]); };
    socket.on("machines", h);
    return () => socket.off("machines", h);
  }, [id, isUser, userMach, pushPoint]);

  const sensors = machine?.sensors || {};
  const sKeys = useMemo(() => Object.keys(sensors), [JSON.stringify(sensors)]);
  const status = machine?.status || "Normal";
  const cond = COND[status] || COND.Normal;
  const displayName = getMachineName(id, machine?.name || "");
  const opStatus = getOperationalStatus(id);
  const opPill = OP_PILL[opStatus] || OP_PILL.Active;
  const runtime = getRuntimeHours(id);

  const lineData = useMemo(() => {
    const cutoff = Date.now() - TIME_RANGES[timeRange];
    return history
      .filter(p => p.ts >= cutoff)
      .map(p => {
        const row = { time: p.time };
        sKeys.forEach(k => {
          if (typeof p[k] === "number") { row[k] = normalize(k, p[k]); row[k + "_r"] = p[k]; }
        });
        return row;
      });
  }, [history, sKeys, timeRange]);

  const distData = useMemo(() =>
    sKeys.map((k, i) => ({
      name: k === "cpuTemp" ? "CPU Temp" : k,
      rawKey: k,
      value: Math.max(0, parseFloat(normalize(k, sensors[k] ?? 0).toFixed(1))),
      actual: sensors[k] ?? 0,
      unit: SENSOR_UNITS[k] ?? "",
      color: LINE_COLORS[i % LINE_COLORS.length],
    })),
    [sensors, sKeys]
  );

  const visible = selectedSensor === "all" ? sKeys : sKeys.filter(k => k === selectedSensor);

  // Shared card style
  const card = (extra = {}) => ({
    background: c.bgCard,
    border: `1px solid ${c.borderCard}`,
    borderRadius: "14px",
    padding: "16px",
    backdropFilter: c.isGlass ? "blur(20px)" : "none",
    WebkitBackdropFilter: c.isGlass ? "blur(20px)" : "none",
    boxShadow: isDark ? "none" : "0 6px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
    ...extra,
  });

  const btnSel = (active) => ({
    border: "none", borderRadius: "6px", cursor: "pointer",
    padding: "3px 9px", fontSize: "11px", fontFamily: c.fontMono, fontWeight: 700,
    background: active ? "#4f46e5" : "transparent",
    color: active ? "#fff" : c.textMuted,
    transition: "background 0.15s, color 0.15s",
  });
  const segBox = {
    display: "flex",
    background: isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.1)",
    borderRadius: "8px", padding: "2px", gap: "2px",
    border: `1px solid ${c.borderInput}`,
  };

  const chartBg = isDark ? "#08080e" : "#0a0a14"; // always dark — Grafana style

  const shell = (children) => (
    <div style={{ background: "transparent", minHeight: "100vh" }}>
      <Sidebar />
      {children}
    </div>
  );

  if (!machine) return shell(
    <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <Spinner />
    </main>
  );

  function saveName() {
    if (nameInput.trim()) setMachineName(id, nameInput.trim());
    setEditingName(false);
  }

  function handleDelete() {
    deleteMachine(id);
    navigate("/dashboard");
  }


  return shell(
    <main style={{ flex: 1, padding: "20px 28px", minWidth: 0, overflowX: "hidden", display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={() => navigate("/dashboard")} style={{
          display: "flex", alignItems: "center", gap: "5px",
          background: "transparent", border: `1px solid ${c.borderInput}`,
          borderRadius: "7px", color: c.textMuted, padding: "5px 10px",
          fontSize: "12px", cursor: "pointer", fontFamily: c.fontBody,
        }}>
          <BackIcon />Back
        </button>

        {/* Editable name */}
        {editingName ? (
          <input autoFocus value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onBlur={saveName}
            onKeyDown={e => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
            style={{
              fontSize: "18px", fontWeight: 800, fontFamily: c.fontHeading,
              background: isDark ? "#161618" : "#eef1f8",
              border: `1px solid ${isDark ? "#7c3aed" : "#c8d2e8"}`,
              borderRadius: "8px", color: c.textPrimary, padding: "4px 12px",
              outline: "none", letterSpacing: "-0.03em",
            }}
          />
        ) : (
          <h1 style={{ fontSize: "18px", fontWeight: 800, color: c.textPrimary, fontFamily: c.fontHeading, letterSpacing: "-0.03em", margin: 0 }}>
            {displayName}
          </h1>
        )}

        <span style={{ background: cond.pill, color: cond.pillText, borderRadius: "999px", padding: "3px 10px", fontSize: "11px", fontWeight: 700, fontFamily: c.fontBody, display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: cond.dot, animation: status !== "Normal" ? "condPulse 1.8s ease-in-out infinite" : "none" }} />
          {status}
        </span>
        <span style={{ background: opPill.bg, color: opPill.color, borderRadius: "999px", padding: "3px 10px", fontSize: "11px", fontWeight: 700, fontFamily: c.fontBody }}>{opStatus}</span>
        <span style={{ fontSize: "12px", color: c.textMuted, fontFamily: c.fontMono }}>⏱ {fmtRuntime(runtime)}</span>

        {/* ── Action buttons ───── */}
        <div style={{ marginLeft: "auto", display: "flex", gap: "6px", alignItems: "center" }}>

          {/* Edit Name */}
          <DetailBtn
            title="Rename machine" onClick={() => { setEditingName(true); setNameInput(displayName); setShowLimits(false); }}
            isDark={isDark} icon={<EditIcon />}
          >
            Rename
          </DetailBtn>

          {/* Set Limits */}
          <DetailBtn
            title="Set sensor alert limits" onClick={() => { setShowLimits(v => !v); setEditingName(false); setConfirmDel(false); }}
            isDark={isDark} active={showLimits} icon={<BellIcon />}
          >
            Limits
          </DetailBtn>

          {/* Delete */}
          {confirmDel ? (
            <>
              <DetailBtn title="Confirm delete" onClick={handleDelete} isDark={isDark} danger icon={<CheckIcon />}>Confirm</DetailBtn>
              <DetailBtn title="Cancel" onClick={() => setConfirmDel(false)} isDark={isDark} icon={<XIcon />}>Cancel</DetailBtn>
            </>
          ) : (
            <DetailBtn title="Remove from tracking" onClick={() => setConfirmDel(true)} isDark={isDark} danger icon=<TrashIcon />>Delete</DetailBtn>
          )}
        </div>
      </div>

      {/* ── Limits panel ─────────────────────────────────── */}
      {showLimits && (
        <LimitsPanel
          machineId={id}
          sKeys={sKeys}
          sensors={machine?.sensors || {}}
          getMachineLimits={getMachineLimits}
          setMachineLimit={setMachineLimit}
          removeMachineLimit={removeMachineLimit}
          c={c} isDark={isDark}
          onClose={() => setShowLimits(false)}
        />
      )}

      {/* ── Tab bar ──────────────────────────────────────── */}
      <div style={{
        display: "flex", gap: "2px",
        background: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.06)",
        borderRadius: "12px", padding: "3px",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
        alignSelf: "flex-start",
      }}>
        {[
          { key: "overview", label: "Overview" },
          { key: "analytics", label: "Analytics" },
          { key: "maintenance", label: "Maintenance" },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: "7px 18px", borderRadius: "9px", border: "none", cursor: "pointer",
            fontFamily: c.fontBody, fontSize: "12px", fontWeight: activeTab === tab.key ? 700 : 500,
            background: activeTab === tab.key
              ? (isDark ? "#1e1e2e" : "#fff")
              : "transparent",
            color: activeTab === tab.key ? c.textPrimary : c.textMuted,
            boxShadow: activeTab === tab.key
              ? (isDark ? "0 2px 8px rgba(0,0,0,0.4)" : "0 1px 4px rgba(0,0,0,0.1)")
              : "none",
            transition: "all 0.15s",
          }}>{tab.label}</button>
        ))}
      </div>

      {/* ══════════════════════ OVERVIEW TAB ══════════════════════ */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", gap: "14px", alignItems: "stretch" }}>

          {/* LEFT: sensor chips + area chart stacked */}
          <div style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Sensor chips — auto-fit fills all space equally */}
            <div style={card()}>
              <p style={{ fontSize: "10px", color: c.textMuted, fontFamily: c.fontBody, letterSpacing: "0.07em", marginBottom: "12px", margin: "0 0 12px" }}>
                LIVE SENSOR READINGS
              </p>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                gap: "10px",
              }}>
                {sKeys.map((k, i) => {
                  const sv = machine.sensorStatus?.[k];
                  const val = sensors[k];
                  const pct = Math.max(0, Math.min(100, normalize(k, val ?? 0)));
                  const col = LINE_COLORS[i % LINE_COLORS.length];
                  const warn = sv === "Critical";
                  const caution = sv === "Warning";
                  const isSelected = selectedSensor === k;

                  const chipBg = warn
                    ? (isDark ? "rgba(239,68,68,0.1)" : "rgba(254,226,226,0.55)")
                    : caution
                      ? (isDark ? "rgba(245,158,11,0.08)" : "rgba(254,243,199,0.55)")
                      : (isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.5)");
                  const chipBorder = warn ? "rgba(239,68,68,0.3)" : caution ? "rgba(245,158,11,0.3)" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.6)");
                  const valCol = warn ? "#f87171" : caution ? "#fbbf24" : c.textPrimary;

                  return (
                    <div key={k}
                      onClick={() => setSelectedSensor(isSelected ? "all" : k)}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${col}22`; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = isSelected ? `0 0 0 1px ${col}44` : "none"; }}
                      style={{
                        background: chipBg,
                        border: `1.5px solid ${isSelected ? col : chipBorder}`,
                        borderRadius: "14px",
                        overflow: "hidden",
                        backdropFilter: c.isGlass ? "blur(12px)" : "none",
                        WebkitBackdropFilter: c.isGlass ? "blur(12px)" : "none",
                        cursor: "pointer",
                        transition: "transform 0.22s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.22s, border-color 0.15s",
                        boxShadow: isSelected ? `0 0 0 1px ${col}44` : "none",
                        display: "flex", flexDirection: "column",
                      }}
                    >
                      <div style={{ height: "3px", background: col, opacity: isSelected ? 1 : 0.45, transition: "opacity 0.15s" }} />
                      <div style={{ padding: "10px 10px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flex: 1 }}>
                        <div style={{ fontSize: "9px", color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: c.fontBody, textAlign: "center", display: "flex", alignItems: "center", gap: "4px" }}>
                          {sv && sv !== "Normal" && (
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: valCol, display: "inline-block", flexShrink: 0, boxShadow: `0 0 4px ${valCol}` }} />
                          )}
                          {k === "cpuTemp" ? "CPU Temp" : k}
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                          <span style={{ fontSize: "24px", fontWeight: 800, color: valCol, fontFamily: c.fontMono, lineHeight: 1, letterSpacing: "-0.02em" }}>
                            {typeof val === "number" ? val.toFixed(1) : val}
                          </span>
                          <span style={{ fontSize: "10px", color: c.textMuted, fontFamily: c.fontBody, paddingBottom: "2px" }}>{SENSOR_UNITS[k] || ""}</span>
                        </div>
                        <div style={{ width: "100%", height: "3px", background: isDark ? "#1a1a1a" : "rgba(0,0,0,0.1)", borderRadius: "2px", overflow: "hidden", marginTop: "4px" }}>
                          <div style={{ height: "100%", width: `${pct.toFixed(0)}%`, background: col, borderRadius: "2px", transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)", boxShadow: `0 0 4px ${col}` }} />
                        </div>
                        <div style={{ fontSize: "8px", color: col, fontFamily: c.fontMono, opacity: 0.7 }}>{pct.toFixed(0)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grafana-style area chart */}
            <div style={{ ...card({ padding: 0 }), overflow: "hidden", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: c.textPrimary, fontFamily: c.fontHeading, flex: 1 }}>Sensor Trends</span>
                <div style={segBox}>
                  {Object.keys(TIME_RANGES).map(t => (
                    <button key={t} onClick={() => setTimeRange(t)} style={btnSel(timeRange === t)}>{t}</button>
                  ))}
                </div>
                <select value={selectedSensor} onChange={e => setSelectedSensor(e.target.value)} style={{ background: c.bgInput, border: `1px solid ${c.borderInput}`, borderRadius: "7px", color: c.textPrimary, padding: "3px 8px", fontSize: "11px", fontFamily: c.fontBody, outline: "none" }}>
                  <option value="all">All Sensors</option>
                  {sKeys.map(k => <option key={k} value={k}>{k === "cpuTemp" ? "CPU Temp" : k}</option>)}
                </select>
              </div>
              <div style={{ background: chartBg, padding: "10px 4px 0 0" }}>
                <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-body)", letterSpacing: "0.07em", padding: "0 16px 6px", margin: 0 }}>NORMALIZED 0 – 100%</p>
                {lineData.length < 2
                  ? <div style={{ height: 170, display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner /></div>
                  : (
                    <ResponsiveContainer width="100%" height={170}>
                      <AreaChart data={lineData} margin={{ top: 4, right: 12, left: -22, bottom: 0 }}>
                        <defs>
                          {visible.map(k => {
                            const col = LINE_COLORS[sKeys.indexOf(k) % LINE_COLORS.length];
                            return (<linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={col} stopOpacity={0.28} /><stop offset="95%" stopColor={col} stopOpacity={0} /></linearGradient>);
                          })}
                        </defs>
                        <CartesianGrid strokeDasharray="1 4" stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="time" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: "'Roboto Mono',monospace" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                        <YAxis domain={[-5, 105]} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9, fontFamily: "'Roboto Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `${Math.round(v)}%`} tickCount={5} />
                        <Tooltip content={<AreaTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }} />
                        {visible.map(k => {
                          const col = LINE_COLORS[sKeys.indexOf(k) % LINE_COLORS.length];
                          return (<Area key={k} type="monotone" dataKey={k} stroke={col} strokeWidth={selectedSensor === "all" ? 1.5 : 2.5} fill={`url(#grad-${k})`} dot={false} isAnimationActive={false} strokeLinecap="round" strokeLinejoin="round" />);
                        })}
                      </AreaChart>
                    </ResponsiveContainer>
                  )
                }
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", padding: "10px 16px", background: chartBg, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                {visible.map(k => {
                  const col = LINE_COLORS[sKeys.indexOf(k) % LINE_COLORS.length];
                  return (<div key={k} onClick={() => setSelectedSensor(selectedSensor === k ? "all" : k)} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", fontFamily: c.fontBody, cursor: "pointer", color: col, opacity: selectedSensor === k || selectedSensor === "all" ? 1 : 0.4, transition: "opacity 0.15s" }}><span style={{ display: "inline-block", width: "14px", height: "2px", background: col, borderRadius: "1px" }} />{k === "cpuTemp" ? "CPU" : k}</div>);
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: distribution */}
          <div style={{ ...card({ width: 230, flexShrink: 0 }), display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ flex: 1, fontSize: "12px", fontWeight: 700, color: c.textPrimary, fontFamily: c.fontHeading }}>Distribution</span>
              <div style={segBox}>
                {["pie", "bar"].map(t => (<button key={t} onClick={() => setChartType(t)} style={btnSel(chartType === t)}>{t}</button>))}
              </div>
            </div>
            {chartType === "pie"
              ? <DonutChart data={distData} textColor={c.textMuted} />
              : (
                <BRC width="100%" height={220}>
                  <BarChart data={distData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                    <BGrid strokeDasharray="2 4" stroke={isDark ? "#1a1a1a" : "rgba(255,255,255,0.07)"} horizontal={false} />
                    <BXAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fill: c.textMuted, fontSize: 9, fontFamily: "'Roboto Mono',monospace" }} axisLine={false} tickLine={false} />
                    <BYAxis type="category" dataKey="name" tick={{ fill: c.textSecondary, fontSize: 10, fontFamily: c.fontBody }} axisLine={false} tickLine={false} width={58} />
                    <BTooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={({ active, payload }) => { if (!active || !payload?.length) return null; const d = payload[0].payload; return <div style={{ background: "rgba(6,4,18,0.97)", border: `1px solid ${d.color}44`, borderRadius: 8, padding: "7px 11px", fontFamily: c.fontMono, fontSize: 12, color: d.color }}>{d.actual.toFixed(1)}{d.unit} · {d.value}%</div>; }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                      {distData.map(d => <Cell key={d.name} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </BRC>
              )
            }
          </div>
        </div>
      )}

      {/* ══════════════════════ ANALYTICS TAB ══════════════════════ */}
      {activeTab === "analytics" && (
        <AnalyticsTab history={history} sKeys={sKeys} chartBg={chartBg} c={c} isDark={isDark} card={card} btnSel={btnSel} segBox={segBox} opStatus={opStatus} />
      )}

      {/* ══════════════════════ MAINTENANCE TAB ══════════════════════ */}
      {activeTab === "maintenance" && (
        <MaintenanceTab
          machineId={id} status={status} runtime={runtime}
          sensorStatus={machine?.sensorStatus || {}}
          stressCycles={stressCycles}
          sensors={machine?.sensors || {}}
          history={history}
          machineStart={machineStartRef.current}
          opStatus={opStatus}
          simResult={simResult} simRunning={simRunning}
          onSimulate={() => {
            setSimRunning(true);
            setTimeout(() => {
              const { sensors: simSensors, crossings } = simulateTicks(machine?.sensors || {}, 100);
              const totalCycles = stressCycles + crossings;
              const score = computeMaintenanceScore({
                status, runtimeHours: runtime + 10, // simulate 10 extra hours
                sensorStatus: {}, stressCycles: totalCycles,
              });
              const { date, daysAway } = predictNextMaintenance(score);
              setSimResult({ score, date, daysAway, crossings, totalCycles });
              setSimRunning(false);
            }, 1200);
          }}
          c={c} isDark={isDark} card={card}
        />
      )}

      <style>{`@keyframes condPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(1.35)}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 5, height: 5, borderRadius: "50%", background: "#818cf855",
          animation: `condPulse 1.4s ease-in-out ${i * 0.18}s infinite`
        }} />
      ))}
    </div>
  );
}

// ── Icon SVGs ─────────────────────────────────────────────────────────────────
const EditIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" /></svg>;
const TrashIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /><path d="M9 6V4h6v2" /></svg>;
const BellIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
const CheckIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>;
const XIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const PdfIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

// ── Compact action button ─────────────────────────────────────────────────────
function DetailBtn({ children, onClick, title, danger, active, accent, isDark, icon }) {
  const [hov, setHov] = useState(false);
  const base = danger
    ? { bg: isDark ? "#2a0000" : "rgba(239,68,68,0.07)", border: "rgba(239,68,68,0.25)", color: "#f87171" }
    : accent
      ? { bg: isDark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.35)", color: "#10b981" }
      : active
        ? { bg: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.5)", color: "#818cf8" }
        : { bg: "transparent", border: isDark ? "rgba(255,255,255,0.1)" : "#dde3f0", color: isDark ? "#9ca3af" : "#6b7280" };
  const hoverBg = danger ? "rgba(239,68,68,0.14)" : accent ? "rgba(16,185,129,0.18)" : "rgba(99,102,241,0.12)";
  const hoverCol = danger ? "#fca5a5" : accent ? "#34d399" : "#818cf8";

  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: "5px",
        background: hov ? hoverBg : base.bg,
        border: `1px solid ${base.border}`,
        borderRadius: "8px", color: hov ? hoverCol : base.color,
        padding: "6px 12px", fontSize: "12px", fontWeight: 600,
        fontFamily: "var(--font-body)", cursor: "pointer",
        transition: "background 0.15s, color 0.15s, border-color 0.15s",
      }}
    >
      {icon}{children}
    </button>
  );
}

const SENSOR_UNITS_LABEL = {
  temperature: "°C", humidity: "%", power: "kW", pressure: "bar",
  gas: "ppm", vibration: "mm/s", current: "A", voltage: "V",
  fuel: "%", rpm: " RPM", cpuTemp: "°C", load: "%",
};

// ── Limits panel (inline below header) ───────────────────────────────────────
function LimitsPanel({ machineId, sKeys, sensors, getMachineLimits, setMachineLimit, removeMachineLimit, c, isDark, onClose }) {
  const limits = getMachineLimits(machineId);
  const [drafts, setDrafts] = useState(() => {
    const d = {};
    sKeys.forEach(k => { d[k] = limits[k] !== undefined ? String(limits[k]) : ""; });
    return d;
  });

  function commit(k) {
    const v = parseFloat(drafts[k]);
    if (!isNaN(v)) setMachineLimit(machineId, k, v);
    else removeMachineLimit(machineId, k);
  }

  const panelBg = isDark ? "#0d0d12" : "#f7f8fc";
  const chipBg = isDark ? "#141418" : "#eef1f8";
  const inputSt = {
    width: "72px", background: chipBg,
    border: `1px solid ${isDark ? "#2a2a2a" : "#c8d2e8"}`,
    borderRadius: "7px", color: c.textPrimary,
    padding: "5px 8px", fontSize: "12px", fontFamily: "var(--font-mono)",
    outline: "none", textAlign: "right",
  };

  return (
    <div style={{
      background: panelBg,
      border: `1px solid ${isDark ? "#1e1e24" : "#dde3f0"}`,
      borderRadius: "14px", padding: "18px 20px",
      boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 4px 20px rgba(20,24,44,0.1)",
    }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "14px" }}>
        <span style={{ flex: 1, fontSize: "13px", fontWeight: 700, color: c.textPrimary, fontFamily: "var(--font-heading)" }}>
          🔔 Sensor Alert Limits
        </span>
        <span style={{ fontSize: "11px", color: c.textMuted, fontFamily: "var(--font-body)", marginRight: "12px" }}>
          You'll be alerted (in-app + email) when a value exceeds its limit.
        </span>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: c.textMuted, cursor: "pointer", fontSize: "16px", lineHeight: 1 }}>×</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
        {sKeys.map(k => {
          const unit = SENSOR_UNITS_LABEL[k] || "";
          const label = k === "cpuTemp" ? "CPU Temp" : k.charAt(0).toUpperCase() + k.slice(1);
          const current = sensors[k];
          const hasLimit = drafts[k] !== "";
          return (
            <div key={k} style={{ background: chipBg, borderRadius: "10px", padding: "10px 12px", border: `1px solid ${isDark ? "transparent" : "#dde3f0"}` }}>
              <div style={{ fontSize: "10px", color: c.textMuted, fontFamily: "var(--font-body)", marginBottom: "6px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {label}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: c.textMuted, fontFamily: "var(--font-mono)", flex: 1 }}>
                  Now: <span style={{ color: c.textPrimary, fontWeight: 700 }}>{typeof current === "number" ? current.toFixed(1) : "—"}{unit}</span>
                </span>
                <input
                  type="number" placeholder="Limit"
                  value={drafts[k]}
                  onChange={e => setDrafts(p => ({ ...p, [k]: e.target.value }))}
                  onBlur={() => commit(k)}
                  onKeyDown={e => e.key === "Enter" && commit(k)}
                  style={inputSt}
                />
                <span style={{ fontSize: "10px", color: c.textMuted, fontFamily: "var(--font-mono)" }}>{unit}</span>
                {hasLimit && (
                  <button onClick={() => { setDrafts(p => ({ ...p, [k]: "" })); removeMachineLimit(machineId, k); }}
                    style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: "0 2px" }}
                    title="Remove limit"
                  >×</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── AnalyticsTab ──────────────────────────────────────────────────────────────
function AnalyticsTab({ history, sKeys, chartBg, c, isDark, card }) {
  const CHART_CFG = [
    { key: "power", label: "Power vs Time", unit: "kW", color: "#818cf8" },
    { key: "vibration", label: "Vibration vs Time", unit: "mm/s", color: "#f87171" },
    { key: "load", label: "Utilisation", unit: "%", color: "#34d399" },
    { key: "rpm", label: "RPM Trend", unit: "RPM", color: "#fbbf24" },
  ];

  const last60 = history.slice(-60);

  function SingleChart({ sensorKey, label, unit, color }) {
    const data = last60.map(p => ({
      time: p.time,
      value: typeof p[sensorKey] === "number" ? parseFloat(p[sensorKey].toFixed(2)) : null,
    })).filter(p => p.value !== null);

    const has = sKeys.includes(sensorKey);

    return (
      <div style={{ ...card({ padding: 0 }), overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}`, marginRight: 8, flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: "12px", fontWeight: 700, color: c.textPrimary, fontFamily: c.fontHeading }}>{label}</span>
          <span style={{ fontSize: "10px", color: c.textMuted, fontFamily: "var(--font-mono)" }}>{unit}</span>
        </div>
        <div style={{ background: chartBg, padding: "10px 4px 4px 0" }}>
          {!has ? (
            <div style={{ height: 130, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.18)", fontSize: 12, fontFamily: "var(--font-body)" }}>
              Sensor not available on this machine
            </div>
          ) : data.length < 2 ? (
            <div style={{ height: 130, display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner /></div>
          ) : (
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={data} margin={{ top: 4, right: 12, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id={`ag-${sensorKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="1 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 8, fontFamily: "'Roboto Mono',monospace" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 8, fontFamily: "'Roboto Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div style={{ background: "rgba(6,4,18,0.95)", border: `1px solid ${color}44`, borderRadius: 8, padding: "7px 11px", fontFamily: "var(--font-mono)", fontSize: 12, color }}>
                        {payload[0].value} {unit}
                      </div>
                    );
                  }}
                  cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#ag-${sensorKey})`} dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  }

  // Idle periods — derive from history where we can detect zero-drift periods
  const idleData = (() => {
    if (last60.length < 2) return [];
    return last60.map((p, i) => {
      const prev = last60[i - 1];
      if (!prev) return { time: p.time, activity: 100 };
      const keys = Object.keys(p).filter(k => k !== "time" && k !== "ts" && typeof p[k] === "number");
      const totalDrift = keys.reduce((sum, k) => sum + Math.abs((p[k] || 0) - (prev[k] || 0)), 0);
      const activity = Math.min(100, totalDrift * 5); // scale drift to 0-100
      return { time: p.time, activity: parseFloat(activity.toFixed(1)) };
    });
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        {CHART_CFG.map(cfg => (
          <SingleChart key={cfg.key} sensorKey={cfg.key} label={cfg.label} unit={cfg.unit} color={cfg.color} />
        ))}
      </div>

      {/* Idle Periods */}
      <div style={{ ...card({ padding: 0 }), overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, display: "flex", alignItems: "center" }}>
          <span style={{ flex: 1, fontSize: "12px", fontWeight: 700, color: c.textPrimary, fontFamily: c.fontHeading }}>Activity / Idle Periods</span>
          <span style={{ fontSize: "10px", color: c.textMuted, fontFamily: "var(--font-body)" }}>Sensor drift per cycle</span>
        </div>
        <div style={{ background: chartBg, padding: "10px 4px 4px 0" }}>
          {idleData.length < 2 ? (
            <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner /></div>
          ) : (
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={idleData} margin={{ top: 4, right: 12, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="ag-idle" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="1 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 8, fontFamily: "'Roboto Mono',monospace" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.15)", fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const v = payload[0].value;
                    return (
                      <div style={{ background: "rgba(6,4,18,0.95)", border: "1px solid #a78bfa44", borderRadius: 8, padding: "6px 10px", fontFamily: "var(--font-mono)", fontSize: 11, color: "#a78bfa" }}>
                        {v < 10 ? "— Idle" : v < 40 ? "~ Low activity" : "+ Active"} · {v}%
                      </div>
                    );
                  }}
                  cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="activity" stroke="#a78bfa" strokeWidth={2} fill="url(#ag-idle)" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MaintenanceTab ────────────────────────────────────────────────────────────
function MaintenanceTab({ status, runtime, sensorStatus, stressCycles, sensors, history, machineStart, opStatus, simResult, simRunning, onSimulate, c, isDark, card }) {
  const score = computeMaintenanceScore({ status, runtimeHours: runtime, sensorStatus, stressCycles });
  const sev = scoreSeverity(score);
  const { date, daysAway } = predictNextMaintenance(score);
  const confidence = getConfidence(history.length);

  const startDate = new Date(machineStart);
  const fmtDate = (d) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const StatCard = ({ icon, label, value, sub, accent }) => (
    <div style={{
      ...card(),
      display: "flex", flexDirection: "column", gap: "6px",
      borderLeft: accent ? `3px solid ${accent}` : undefined,
    }}>
      <div style={{ fontSize: "11px", color: c.textMuted, fontFamily: c.fontBody, display: "flex", alignItems: "center", gap: "6px" }}>
        <span>{icon}</span> {label}
      </div>
      <div style={{ fontSize: "24px", fontWeight: 800, color: accent || c.textPrimary, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em", lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: "10px", color: c.textMuted, fontFamily: c.fontBody }}>{sub}</div>}
    </div>
  );

  // Gauge ring for the score
  const radius = 40, stroke = 8;
  const circ = 2 * Math.PI * radius;
  const dash = (score / 100) * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* ── Top stats row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
        <StatCard
          icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
          label="Total Runtime" value={`${Math.floor(runtime)}h ${Math.floor((runtime % 1) * 60)}m`} sub={`Started ${fmtDate(startDate)}`} accent="#818cf8" />
        <StatCard
          icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="13 2 13 9 20 9" /><path d="M11 2H3l3.5 7-3.5 7h8l3.5-7z" /></svg>}
          label="Stress Cycles" value={stressCycles} sub="Threshold crossings detected" accent="#fbbf24" />
        <StatCard
          icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>}
          label="Op Status" value={opStatus} sub={`Machine status: ${status}`} accent={{ Active: "#22c55e", Idle: "#f59e0b", Off: "#94a3b8" }[opStatus]} />
        <StatCard
          icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}
          label="Data Quality" value={`${Math.min(100, Math.round((history.length / 100) * 100))}%`} sub={`${history.length} data points collected`} accent="#34d399" />
      </div>

      {/* ── Maintenance prediction card ── */}
      <div style={{
        ...card(),
        border: `1px solid ${sev.color}30`,
        background: isDark ? `${sev.color}08` : `${sev.color}05`,
      }}>
        {/* Experimental badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: c.textPrimary, fontFamily: c.fontHeading, flex: 1 }}>
            Maintenance Prediction
          </span>
          <span style={{
            background: "rgba(251,191,36,0.12)", color: "#fbbf24",
            border: "1px solid rgba(251,191,36,0.3)",
            borderRadius: "999px", padding: "2px 10px",
            fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", fontFamily: c.fontBody,
          }}>Experimental</span>
        </div>

        <div style={{ display: "flex", gap: "28px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Score gauge */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <svg width={100} height={100} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={radius} fill="none" stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"} strokeWidth={stroke} />
              <circle cx="50" cy="50" r={radius} fill="none"
                stroke={sev.color} strokeWidth={stroke}
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeLinecap="round"
                style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dasharray 0.8s ease", filter: `drop-shadow(0 0 6px ${sev.color}88)` }}
              />
              <text x="50" y="44" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 18, fontWeight: 800, fill: sev.color, fontFamily: "'Roboto Mono', monospace" }}>{score}</text>
              <text x="50" y="62" textAnchor="middle" style={{ fontSize: 9, fill: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", fontFamily: "sans-serif" }}>/ 100</text>
            </svg>
            <span style={{
              background: sev.bg, color: sev.color, border: `1px solid ${sev.color}40`,
              borderRadius: "999px", padding: "3px 12px",
              fontSize: "11px", fontWeight: 700, fontFamily: c.fontBody,
            }}>{sev.icon} {sev.label} Priority</span>
          </div>

          {/* Breakdown + prediction */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
              {[
                { label: "Runtime wear", pct: Math.min(100, Math.round((runtime / 50) * 5)), color: "#818cf8" },
                { label: "Stress cycles", pct: Math.min(100, Math.round((stressCycles / 20) * 100)), color: "#fbbf24" },
                { label: "Sensor health", pct: Math.min(100, Object.values(sensorStatus).filter(s => s !== "Normal").length * 25), color: "#f87171" },
                { label: "Status factor", pct: status === "Critical" ? 100 : status === "Warning" ? 50 : 0, color: "#f59e0b" },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "10px", color: c.textMuted, fontFamily: c.fontBody }}>{f.label}</span>
                    <span style={{ fontSize: "10px", color: f.color, fontFamily: "var(--font-mono)", fontWeight: 700 }}>{f.pct}%</span>
                  </div>
                  <div style={{ height: "4px", background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${f.pct}%`, background: f.color, borderRadius: "2px", transition: "width 0.6s ease", boxShadow: `0 0 5px ${f.color}88` }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "9px", color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: c.fontBody, marginBottom: "2px" }}>Next Maintenance</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: c.textPrimary, fontFamily: "var(--font-mono)" }}>{fmtDate(date)}</div>
                <div style={{ fontSize: "10px", color: sev.color, fontFamily: c.fontBody }}>in ~{daysAway} days</div>
              </div>
              <div>
                <div style={{ fontSize: "9px", color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: c.fontBody, marginBottom: "2px" }}>Confidence</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: confidence.color, fontFamily: "var(--font-mono)" }}>{confidence.label}</div>
                <div style={{ fontSize: "10px", color: c.textMuted, fontFamily: c.fontBody }}>{history.length} samples</div>
              </div>
            </div>
          </div>
        </div>

        {/* Simulation section */}
        <div style={{ marginTop: "18px", paddingTop: "16px", borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: c.textPrimary, fontFamily: c.fontHeading, marginBottom: "2px" }}>100× Stress Simulation</div>
              <div style={{ fontSize: "11px", color: c.textMuted, fontFamily: c.fontBody }}>
                Runs 100 synthetic telemetry cycles with wear bias to project future maintenance needs.
              </div>
            </div>
            <button
              onClick={onSimulate}
              disabled={simRunning}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: simRunning ? (isDark ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.07)") : "#4f46e5",
                color: simRunning ? "#818cf8" : "#fff",
                border: simRunning ? "1px solid rgba(99,102,241,0.3)" : "none",
                borderRadius: "10px", padding: "9px 20px",
                fontSize: "12px", fontWeight: 700, fontFamily: c.fontBody, cursor: simRunning ? "not-allowed" : "pointer",
                boxShadow: simRunning ? "none" : "0 4px 14px rgba(79,70,229,0.4)",
                transition: "all 0.2s",
              }}
            >
              {simRunning
                ? <><span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid #818cf8", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Simulating…</>
                : <><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><polygon points="5 3 19 12 5 21 5 3" /></svg> Run 100× Simulation</>
              }
            </button>
          </div>

          {/* Sim result */}
          {simResult && !simRunning && (
            <div style={{
              marginTop: "14px",
              background: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.04)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
              borderRadius: "10px", padding: "12px 16px",
              display: "flex", gap: "24px", flexWrap: "wrap",
            }}>
              <div>
                <div style={{ fontSize: "9px", color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: c.fontBody, marginBottom: "2px" }}>Projected Score</div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: scoreSeverity(simResult.score).color, fontFamily: "var(--font-mono)" }}>{simResult.score}</div>
              </div>
              <div>
                <div style={{ fontSize: "9px", color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: c.fontBody, marginBottom: "2px" }}>Threshold Crossings</div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#fbbf24", fontFamily: "var(--font-mono)" }}>{simResult.crossings}</div>
              </div>
              <div>
                <div style={{ fontSize: "9px", color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: c.fontBody, marginBottom: "2px" }}>Projected Next Maintenance</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: c.textPrimary, fontFamily: "var(--font-mono)" }}>{fmtDate(simResult.date)}</div>
                <div style={{ fontSize: "10px", color: scoreSeverity(simResult.score).color }}>{scoreSeverity(simResult.score).icon} in ~{simResult.daysAway} days</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
