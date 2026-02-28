import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useMachines } from "../context/MachinesContext";
import { useTheme } from "../context/ThemeContext";
import { useAlerts } from "../context/AlertsContext";
import socket from "../services/socket";

// ── Icons ─────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const ChevronIcon = ({ up }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <polyline points={up ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
    </svg>
);

const SENSOR_LABELS = {
    temperature: "Temp", humidity: "Humidity", power: "Power", pressure: "Pressure",
    gas: "Gas", vibration: "Vibration", current: "Current", voltage: "Voltage",
    fuel: "Fuel", rpm: "RPM", cpuTemp: "CPU°", load: "Load",
};
const SENSOR_UNITS = {
    temperature: "°C", humidity: "%", power: "kW", pressure: "bar",
    gas: "ppm", vibration: "mm/s", current: "A", voltage: "V",
    fuel: "%", rpm: "", cpuTemp: "°C", load: "%",
};

function StatusDot({ status }) {
    const c = status === "Critical" ? "#ef4444" : status === "Warning" ? "#f59e0b" : "#22c55e";
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            background: `${c}18`, color: c,
            padding: "3px 9px", borderRadius: "999px", fontSize: "11px", fontWeight: 700,
        }}>
            <span style={{
                width: 6, height: 6, borderRadius: "50%", background: c,
                animation: status !== "Normal" ? "pulse 1.8s ease-in-out infinite" : "none",
                display: "inline-block",
            }} />
            {status}
        </span>
    );
}

const COLS = [
    { key: "name", label: "Machine", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "opStatus", label: "State", sortable: true },
    { key: "condition", label: "Condition", sortable: false },
    { key: "sensors", label: "Live Sensors (top 4)", sortable: false },
    { key: "action", label: "", sortable: false },
];

export default function MachinesPage() {
    const { colors: c, isDark } = useTheme();
    const { userMachines, isHidden } = useMachines();
    const { checkLimits } = useAlerts();
    const navigate = useNavigate();

    const [socketMachines, setSocketMachines] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");  // All | Normal | Warning | Critical
    const [sortKey, setSortKey] = useState("name");
    const [sortDir, setSortDir] = useState(1); // 1 asc, -1 desc
    const [searchFocused, setSearchFocused] = useState(false);
    const [viewMode, setViewMode] = useState("list"); // "list" | "model"

    useEffect(() => {
        socket.on("machines", (data) => {
            const arr = Object.values(data);
            setSocketMachines(arr);
            checkLimits(arr);
        });
        return () => socket.off("machines");
    }, [checkLimits]);

    const all = useMemo(() => [
        ...socketMachines.filter(m => !isHidden(String(m.id))),
        ...userMachines,
    ], [socketMachines, userMachines, isHidden]);

    const filtered = useMemo(() => {
        let arr = all;
        if (filter !== "All") arr = arr.filter(m => (m.condition || m.status || "Normal") === filter);
        if (search.trim()) {
            const q = search.toLowerCase();
            arr = arr.filter(m =>
                (m.name || "").toLowerCase().includes(q) ||
                String(m.id || "").toLowerCase().includes(q)
            );
        }
        return [...arr].sort((a, b) => {
            const va = (a[sortKey] || "").toString().toLowerCase();
            const vb = (b[sortKey] || "").toString().toLowerCase();
            return va < vb ? -sortDir : va > vb ? sortDir : 0;
        });
    }, [all, filter, search, sortKey, sortDir]);

    // Model grouping
    const modelGroups = useMemo(() => {
        const groups = {};
        all.forEach(m => {
            const key = (m.name || `Machine ${m.id}`).replace(/\s*#?\d+$/, "").trim() || "Unknown";
            if (!groups[key]) groups[key] = [];
            groups[key].push(m);
        });
        return Object.entries(groups).map(([model, machines]) => ({
            model,
            machines,
            count: machines.length,
            statuses: machines.reduce((acc, m) => {
                const s = m.condition || m.status || "Normal";
                acc[s] = (acc[s] || 0) + 1;
                return acc;
            }, {}),
        }));
    }, [all]);

    // status counts
    const counts = useMemo(() => {
        const r = { All: all.length, Normal: 0, Warning: 0, Critical: 0 };
        all.forEach(m => { const s = m.condition || m.status || "Normal"; if (s in r) r[s]++; });
        return r;
    }, [all]);

    function toggleSort(key) {
        if (sortKey === key) setSortDir(d => -d);
        else { setSortKey(key); setSortDir(1); }
    }

    const bg = isDark ? "#07070a" : "#f5f6fb";
    const cardBg = isDark ? "#0d0d10" : "#fff";
    const border = isDark ? "#1a1a1f" : "#e2e8f0";
    const rowHoverBg = isDark ? "#111116" : "#f8fafc";
    const headBg = isDark ? "#0a0a0e" : "#f1f5f9";
    const textPri = isDark ? "#f0f2fc" : "#0f172a";
    const textMut = isDark ? "#64748b" : "#94a3b8";
    const fontBody = c.fontBody || '"Plus Jakarta Sans",sans-serif';
    const fontMono = c.fontMono || '"Roboto Mono",monospace';

    const FILTER_TABS = ["All", "Normal", "Warning", "Critical"];
    const tabActiveColor = { All: "#6366f1", Normal: "#22c55e", Warning: "#f59e0b", Critical: "#ef4444" };

    return (
        <div style={{ background: bg, minHeight: "100vh" }}>
            <Sidebar />
            <main style={{ padding: "28px 32px" }}>

                {/* ── Page header ── */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h1 style={{ fontSize: "22px", fontWeight: 800, color: textPri, fontFamily: c.fontHeading, letterSpacing: "-0.03em", margin: 0 }}>
                            Machines
                        </h1>
                        <div style={{ fontSize: "12px", color: textMut, fontFamily: fontBody, marginTop: "2px" }}>
                            {all.length} machine{all.length !== 1 ? "s" : ""} tracked
                        </div>
                    </div>

                    {/* Search */}
                    <div style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        background: isDark ? "#0a0a0e" : "#fff",
                        border: `1px solid ${searchFocused ? "#6366f1" : border}`,
                        borderRadius: "10px", padding: "7px 12px", minWidth: "200px",
                        transition: "border-color 0.15s",
                    }}>
                        <span style={{ color: textMut, display: "flex" }}><SearchIcon /></span>
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search machines…"
                            onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
                            style={{ border: "none", background: "transparent", color: textPri, fontSize: "13px", fontFamily: fontBody, outline: "none", width: "100%" }}
                        />
                    </div>

                    {/* View toggle */}
                    <div style={{
                        display: "flex", background: isDark ? "#111116" : "#f1f5f9",
                        borderRadius: "8px", padding: "2px", gap: "2px",
                        border: `1px solid ${border}`, flexShrink: 0,
                    }}>
                        {[{ key: "list", label: "List" }, { key: "model", label: "By Model" }].map(v => (
                            <button key={v.key} onClick={() => setViewMode(v.key)} style={{
                                padding: "5px 12px", borderRadius: "6px", border: "none",
                                fontSize: "11px", fontWeight: 700, fontFamily: fontBody, cursor: "pointer",
                                background: viewMode === v.key ? (isDark ? "#1e1e2e" : "#fff") : "transparent",
                                color: viewMode === v.key ? textPri : textMut,
                                boxShadow: viewMode === v.key ? (isDark ? "none" : "0 1px 4px rgba(0,0,0,0.08)") : "none",
                                transition: "all 0.15s",
                            }}>{v.label}</button>
                        ))}
                    </div>
                </div>

                {/* ── Filter tabs ── */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
                    {FILTER_TABS.map(f => {
                        const active = filter === f;
                        const col = tabActiveColor[f];
                        return (
                            <button key={f} onClick={() => setFilter(f)} style={{
                                padding: "6px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 700,
                                fontFamily: fontBody, cursor: "pointer", border: "none",
                                background: active ? `${col}20` : (isDark ? "#111116" : "#f1f5f9"),
                                color: active ? col : textMut,
                                outline: active ? `1px solid ${col}50` : "none",
                                transition: "all 0.15s",
                            }}>
                                {f} <span style={{ opacity: 0.7 }}>({counts[f]})</span>
                            </button>
                        );
                    })}
                </div>

                {viewMode === "model" ? (
                    <ModelView
                        groups={modelGroups}
                        isDark={isDark} textPri={textPri} textMut={textMut}
                        border={border} fontBody={fontBody} fontMono={fontMono}
                        navigate={navigate}
                    />
                ) : (
                    <div style={{
                        background: cardBg, border: `1px solid ${border}`,
                        borderRadius: "16px", overflow: "hidden",
                        boxShadow: isDark ? "none" : "0 2px 16px rgba(20,24,44,0.06)",
                    }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                            <thead>
                                <tr style={{ background: headBg, borderBottom: `1px solid ${border}` }}>
                                    {COLS.map(col => (
                                        <th key={col.key}
                                            onClick={() => col.sortable && toggleSort(col.key)}
                                            style={{
                                                padding: "11px 16px", textAlign: "left",
                                                fontSize: "10px", fontWeight: 700, color: textMut, fontFamily: fontBody,
                                                textTransform: "uppercase", letterSpacing: "0.07em",
                                                cursor: col.sortable ? "pointer" : "default",
                                                userSelect: "none", whiteSpace: "nowrap",
                                            }}>
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                {col.label}
                                                {col.sortable && sortKey === col.key &&
                                                    <ChevronIcon up={sortDir === 1} />}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={COLS.length} style={{ padding: "48px", textAlign: "center", color: textMut, fontFamily: fontBody }}>
                                            No machines match your filters.
                                        </td>
                                    </tr>
                                ) : filtered.map((m, idx) => (
                                    <MachineRow
                                        key={m.id || idx}
                                        machine={m}
                                        isDark={isDark}
                                        textPri={textPri} textMut={textMut}
                                        border={border} hoverBg={rowHoverBg}
                                        fontBody={fontBody} fontMono={fontMono}
                                        onOpen={() => navigate(`/machine/${m.id}`)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.4)}}`}</style>
            </main>
        </div>
    );
}

function MachineRow({ machine: m, isDark, textPri, textMut, border, hoverBg, fontBody, fontMono, onOpen }) {
    const [hov, setHov] = useState(false);
    const status = m.condition || m.status || "Normal";
    const opStatus = m.operationalStatus || m.opStatus || "Active";
    const sensors = m.sensors || {};
    const sKeys = Object.keys(sensors).slice(0, 4);

    const opColors = {
        Active: { bg: "#e0f2fe", color: "#0369a1" },
        Idle: { bg: "#fef3c7", color: "#92400e" },
        Off: { bg: "#f3f4f6", color: "#374151" },
    };
    const opC = opColors[opStatus] || opColors.Active;

    return (
        <tr
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{
                background: hov ? hoverBg : "transparent",
                borderBottom: `1px solid ${border}`,
                transition: "background 0.1s", cursor: "pointer",
            }}
            onClick={onOpen}
        >
            {/* Machine name */}
            <td style={{ padding: "13px 16px", minWidth: "180px" }}>
                <div style={{ fontWeight: 700, color: textPri, fontFamily: fontBody, fontSize: "13px" }}>
                    {m.name || `Machine ${m.id}`}
                </div>
                <div style={{ fontSize: "10px", color: textMut, fontFamily: fontMono, marginTop: "2px" }}>
                    ID: {m.id}
                </div>
            </td>

            {/* Status */}
            <td style={{ padding: "13px 16px" }}>
                <StatusDot status={status} />
            </td>

            {/* Operational state */}
            <td style={{ padding: "13px 16px" }}>
                <span style={{
                    background: opC.bg, color: opC.color,
                    padding: "3px 9px", borderRadius: "999px",
                    fontSize: "11px", fontWeight: 700, fontFamily: fontBody,
                }}>
                    {opStatus}
                </span>
            </td>

            {/* Condition detail */}
            <td style={{ padding: "13px 16px", color: textMut, fontFamily: fontBody, fontSize: "12px" }}>
                {m.conditionDetails || "—"}
            </td>

            {/* Live sensors (top 4) */}
            <td style={{ padding: "13px 16px" }}>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {sKeys.map(k => {
                        const v = sensors[k];
                        return (
                            <span key={k} style={{
                                background: isDark ? "#1a1a22" : "#f1f5f9",
                                padding: "3px 9px", borderRadius: "7px",
                                fontSize: "11px", fontFamily: fontMono, color: textPri,
                                display: "flex", alignItems: "center", gap: "4px",
                            }}>
                                <span style={{ color: textMut, fontSize: "10px" }}>{SENSOR_LABELS[k] || k}</span>
                                {typeof v === "number" ? v.toFixed(1) : v}{SENSOR_UNITS[k] || ""}
                            </span>
                        );
                    })}
                    {Object.keys(sensors).length === 0 && <span style={{ color: textMut, fontSize: "12px" }}>—</span>}
                </div>
            </td>

            {/* Action */}
            <td style={{ padding: "13px 16px", textAlign: "right" }}>
                <button
                    onClick={e => { e.stopPropagation(); onOpen(); }}
                    style={{
                        background: "transparent",
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#dde3f0"}`,
                        borderRadius: "8px", padding: "5px 12px",
                        fontSize: "12px", fontWeight: 600, fontFamily: fontBody,
                        color: textMut, cursor: "pointer",
                        transition: "border-color 0.15s, color 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#818cf8"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "#dde3f0"; e.currentTarget.style.color = textMut; }}
                >
                    View →
                </button>
            </td>
        </tr>
    );
}

// ── By Model view ─────────────────────────────────────────────────────────────
function ModelView({ groups, isDark, textPri, textMut, border, fontBody, fontMono, navigate }) {
    const [expanded, setExpanded] = useState(null);

    const STATUS_COLOR = {
        Normal: "#22c55e", Warning: "#f59e0b", Critical: "#ef4444",
    };

    if (groups.length === 0) {
        return (
            <div style={{ padding: "48px", textAlign: "center", color: textMut, fontFamily: fontBody, fontSize: "14px" }}>
                No machines found.
            </div>
        );
    }

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {groups.map(({ model, machines, count, statuses }) => {
                const isExpanded = expanded === model;
                const worstStatus = statuses.Critical ? "Critical" : statuses.Warning ? "Warning" : "Normal";
                const accentColor = STATUS_COLOR[worstStatus];

                return (
                    <div key={model} style={{
                        background: isDark ? "#0d0d10" : "#fff",
                        border: `1px solid ${isDark ? "#1a1a1f" : "#e2e8f0"}`,
                        borderLeft: `3px solid ${accentColor}`,
                        borderRadius: "14px", overflow: "hidden",
                        boxShadow: isDark ? "none" : "0 2px 12px rgba(20,24,44,0.06)",
                        transition: "box-shadow 0.2s",
                    }}>
                        {/* Model header */}
                        <div
                            onClick={() => setExpanded(isExpanded ? null : model)}
                            style={{ padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}
                        >
                            {/* Quantity badge */}
                            <div style={{
                                width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
                                background: isDark ? "#1a1a22" : "#f1f5f9",
                                display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center",
                            }}>
                                <span style={{ fontSize: "18px", fontWeight: 800, color: textPri, fontFamily: fontMono, lineHeight: 1 }}>{count}</span>
                                <span style={{ fontSize: "8px", color: textMut, fontFamily: fontBody, letterSpacing: "0.05em", textTransform: "uppercase" }}>units</span>
                            </div>

                            {/* Model name + status pills */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: "14px", fontWeight: 700, color: textPri, fontFamily: fontBody, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "4px" }}>
                                    {model}
                                </div>
                                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                                    {Object.entries(statuses).map(([s, n]) => (
                                        <span key={s} style={{
                                            background: `${STATUS_COLOR[s]}18`, color: STATUS_COLOR[s],
                                            fontSize: "10px", fontWeight: 700, padding: "2px 7px",
                                            borderRadius: "999px", fontFamily: fontBody,
                                        }}>{n} {s}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Chevron */}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={textMut} strokeWidth="2.5" strokeLinecap="round"
                                style={{ flexShrink: 0, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>

                        {/* Expanded rows */}
                        {isExpanded && (
                            <div style={{ borderTop: `1px solid ${isDark ? "#1a1a1f" : "#e2e8f0"}` }}>
                                {machines.map(m => {
                                    const s = m.condition || m.status || "Normal";
                                    return (
                                        <div key={m.id}
                                            onClick={() => navigate(`/machine/${m.id}`)}
                                            style={{
                                                display: "flex", alignItems: "center", gap: "10px",
                                                padding: "10px 18px",
                                                borderBottom: `1px solid ${isDark ? "#111116" : "#f1f5f9"}`,
                                                cursor: "pointer", transition: "background 0.1s",
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = isDark ? "#111116" : "#f8fafc"}
                                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                        >
                                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_COLOR[s], flexShrink: 0, boxShadow: `0 0 5px ${STATUS_COLOR[s]}88` }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: "12px", fontWeight: 600, color: textPri, fontFamily: fontBody, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {m.name || `Machine ${m.id}`}
                                                </div>
                                                <div style={{ fontSize: "10px", color: textMut, fontFamily: fontMono }}>ID: {m.id}</div>
                                            </div>
                                            <span style={{ fontSize: "11px", color: textMut, fontFamily: fontBody }}>View →</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
