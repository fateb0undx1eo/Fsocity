import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMachines } from "../context/MachinesContext";
import { useTheme } from "../context/ThemeContext";

const STATUS_STYLES = {
  Normal: { glow: "rgba(134,239,172,0.28)", badge: { bg: "#dcfce7", color: "#14532d" }, border: "#22c55e" },
  Warning: { glow: "rgba(253,224,71,0.28)", badge: { bg: "#fef9c3", color: "#713f12" }, border: "#eab308" },
  Critical: { glow: "rgba(252,165,165,0.35)", badge: { bg: "#fee2e2", color: "#7f1d1d" }, border: "#ef4444" },
};
const OP_COLORS = {
  Active: { bg: "#dcfce7", color: "#14532d" },
  Idle: { bg: "#fef9c3", color: "#92400e" },
  Off: { bg: "#f3f4f6", color: "#374151" },
};
const OP_TOAST = {
  Active: { title: "Machine Activated", desc: "Sensors updating at full rate.", bg: "#d1fae5", color: "#064e3b" },
  Idle: { title: "Machine Idling", desc: "Readings stabilise — minimal drift.", bg: "#fef3c7", color: "#78350f" },
  Off: { title: "Machine Powered Off", desc: "Sensor updates paused.", bg: "#fee2e2", color: "#7f1d1d" },
};



function fmt(hours) {
  if (hours < 0.017) return "0m";
  const h = Math.floor(hours), m = Math.floor((hours - h) * 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function MachineCard({ machine }) {
  const navigate = useNavigate();
  const { setOperationalStatus, getOperationalStatus, getRuntimeHours, getMachineName } = useMachines();
  const { colors: c, isDark } = useTheme();

  const id = machine.id;
  const status = machine.status || "Normal";
  const ss = STATUS_STYLES[status] || STATUS_STYLES.Normal;
  const opStatus = getOperationalStatus(id);
  const opCol = OP_COLORS[opStatus] || OP_COLORS.Active;
  const displayName = getMachineName(id, machine.name);

  const [hovering, setHovering] = useState(false);
  const [showOpMenu, setShowOpMenu] = useState(false);
  const [runtime, setRuntime] = useState(0);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setRuntime(getRuntimeHours(id));
    const t = setInterval(() => setRuntime(getRuntimeHours(id)), 30000);
    return () => clearInterval(t);
  }, [id, opStatus]);

  function handleStatus(s) {
    setOperationalStatus(id, s); setShowOpMenu(false);
    setToast(OP_TOAST[s]); setTimeout(() => setToast(null), 3500);
  }

  // ── Card style: DARK = glow card / LIGHT = matte solid with status accent ──
  const cardStyle = isDark ? {
    background: "#0d0d10",
    border: `1px solid ${hovering ? ss.border : "#1e1e22"}`,
    borderRadius: "16px", padding: "20px",
    cursor: "pointer", position: "relative", overflow: "hidden",
    transition: "box-shadow 0.22s, border-color 0.2s, transform 0.22s",
    transform: hovering ? "translateY(-3px)" : "translateY(0)",
    boxShadow: hovering ? `0 0 28px 4px ${ss.glow}` : "none",
  } : {
    // Matte: solid clean white-ish card, status left-border accent, shadow depth
    background: "#f7f8fc",
    border: `1px solid ${hovering ? "#c8d2e8" : "#dde3f0"}`,
    borderLeft: `3px solid ${ss.border}`,
    borderRadius: "16px", padding: "20px",
    cursor: "pointer", position: "relative", overflow: "hidden",
    transition: "box-shadow 0.25s, border-color 0.2s, transform 0.28s cubic-bezier(0.34,1.3,0.64,1)",
    transform: hovering ? "translateY(-4px) scale(1.012)" : "translateY(0) scale(1)",
    boxShadow: hovering
      ? "0 8px 32px rgba(20,24,44,0.13), 0 2px 8px rgba(20,24,44,0.07)"
      : "0 1px 4px rgba(20,24,44,0.06), 0 4px 14px rgba(20,24,44,0.04)",
  };

  const chipBg = isDark ? "#141418" : "#eef1f8";
  const chipBorder = isDark ? "transparent" : "#dde3f0";
  const chipLabel = isDark ? "#6b7280" : c.textMuted;

  // Op dropdown style
  const dropdownBg = isDark
    ? "#111"
    : "#f7f8fc";
  const dropdownShadow = isDark
    ? "0 8px 24px rgba(0,0,0,0.4)"
    : "0 8px 24px rgba(20,24,44,0.12)";

  return (
    <div
      onClick={() => !showOpMenu && navigate(`/machine/${id}`)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setShowOpMenu(false); }}
      style={cardStyle}
    >
      {/* Row 1: Name + status badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <h3 style={{ flex: 1, fontSize: "15px", fontWeight: 700, color: c.textPrimary, fontFamily: c.fontHeading, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {displayName}
        </h3>

        <span style={{ background: ss.badge.bg, color: ss.badge.color, fontSize: "9px", fontWeight: 700, padding: "3px 9px", borderRadius: "999px", letterSpacing: "0.07em", textTransform: "uppercase", flexShrink: 0, fontFamily: c.fontBody }}>
          {status}
        </span>
      </div>

      {/* Row 2: Op status + runtime */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }} onClick={e => e.stopPropagation()}>
        <div style={{ position: "relative" }}>
          <button onClick={() => setShowOpMenu(v => !v)} style={{
            background: opCol.bg, color: opCol.color, border: "none", borderRadius: "999px",
            padding: "4px 12px", fontSize: "11px", fontWeight: 700, fontFamily: c.fontBody, cursor: "pointer",
          }}>
            ● {opStatus} ▾
          </button>
          {showOpMenu && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 50,
              background: dropdownBg, border: `1px solid ${isDark ? "#2a2a2a" : "#dde3f0"}`,
              boxShadow: dropdownShadow, borderRadius: "12px", padding: "4px", minWidth: "110px",
            }}>
              {["Active", "Idle", "Off"].map(s => (
                <div key={s} onClick={() => handleStatus(s)} style={{
                  padding: "7px 12px", color: s === opStatus ? (isDark ? "#a78bfa" : "#4f46e5") : c.textPrimary,
                  fontFamily: c.fontBody, fontSize: "13px", cursor: "pointer",
                  borderRadius: "8px", fontWeight: s === opStatus ? 700 : 400,
                }}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "#eef1f8"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >{s}</div>
              ))}
            </div>
          )}
        </div>
        <span style={{ marginLeft: "auto", fontSize: "11px", color: c.textMuted, fontFamily: c.fontMono }}>⏱ {fmt(runtime)}</span>
      </div>

      {/* Row 3: Sensor chips */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {Object.entries(machine.sensors || {}).map(([key, value]) => {
          const sv = machine.sensorStatus?.[key];
          const valColor = sv === "Critical" ? "#ef4444" : sv === "Warning" ? "#d97706" : c.textPrimary;
          return (
            <div key={key} style={{ background: chipBg, borderRadius: "10px", padding: "10px 12px", border: `1px solid ${chipBorder}` }}>
              <div style={{ fontSize: "9px", color: chipLabel, textTransform: "capitalize", marginBottom: "4px", fontFamily: c.fontBody, letterSpacing: "0.05em" }}>
                {key === "cpuTemp" ? "CPU Temp" : key}
              </div>
              <div style={{ fontSize: "17px", fontWeight: 700, color: valColor, lineHeight: 1, fontFamily: c.fontMono }}>
                {typeof value === "number" ? value.toFixed(1) : value}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "12px", fontSize: "10px", color: c.textMuted, textAlign: "right", fontFamily: c.fontBody }}>
        Open live dashboard →
      </div>

      {/* Toast */}
      {toast && (
        <div onClick={e => e.stopPropagation()} style={{
          position: "fixed", bottom: "28px", right: "28px",
          background: toast.bg, borderRadius: "14px", padding: "14px 18px",
          zIndex: 300, maxWidth: "300px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          animation: "mcSlideIn 0.3s ease",
        }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: toast.color, fontFamily: c.fontHeading, marginBottom: "4px" }}>{toast.title}</div>
          <div style={{ fontSize: "12px", color: toast.color, fontFamily: c.fontBody, opacity: 0.8, lineHeight: 1.4 }}>{toast.desc}</div>
        </div>
      )}

      <style>{`@keyframes mcSlideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

