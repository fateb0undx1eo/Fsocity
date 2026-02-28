import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useMachines } from "../context/MachinesContext";
import { useTheme } from "../context/ThemeContext";
import { useAlerts } from "../context/AlertsContext";
import { generateMachinePDF } from "../services/pdfExport";
import socket from "../services/socket";

// ── Icons ─────────────────────────────────────────────────────────────────────
const DownloadIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);
const FileIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);
const AllIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
);

function StatusPill({ status }) {
    const map = {
        Critical: { bg: "#fef2f2", color: "#ef4444", dot: "#ef4444" },
        Warning: { bg: "#fffbeb", color: "#f59e0b", dot: "#f59e0b" },
        Normal: { bg: "#f0fdf4", color: "#22c55e", dot: "#22c55e" },
    };
    const s = map[status] || map.Normal;
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            background: s.bg, color: s.color,
            padding: "3px 9px", borderRadius: "999px",
            fontSize: "11px", fontWeight: 700,
        }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
            {status}
        </span>
    );
}

function ReportCard({ machine, isDark, fontBody, fontMono, textPri, textMut, border, limits, onView }) {
    const [downloading, setDownloading] = useState(false);
    const status = machine.condition || machine.status || "Normal";
    const opStatus = machine.operationalStatus || machine.opStatus || "Active";
    const sensors = machine.sensors || {};
    const sKeys = Object.keys(sensors);

    function handleDownload(e) {
        e.stopPropagation();
        setDownloading(true);
        generateMachinePDF({
            machineName: machine.name || `Machine ${machine.id}`,
            machineId: String(machine.id),
            status,
            opStatus,
            runtimeHours: machine.runtime || 0,
            sensors,
            sensorStatus: machine.sensorStatus || {},
            limits: limits || {},
        });
        setTimeout(() => setDownloading(false), 1800);
    }

    const critCount = sKeys.filter(k =>
        (machine.sensorStatus?.[k] || "Normal") === "Critical"
    ).length;

    const cardBg = isDark ? "#0d0d10" : "#fff";
    const chipBg = isDark ? "#111116" : "#f1f5f9";

    return (
        <div style={{
            background: cardBg,
            border: `1px solid ${status === "Critical" ? "rgba(239,68,68,0.25)" : status === "Warning" ? "rgba(245,158,11,0.2)" : border}`,
            borderRadius: "16px", padding: "20px",
            boxShadow: isDark ? "none" : `0 2px 14px rgba(20,24,44,0.06)`,
            display: "flex", flexDirection: "column", gap: "14px",
            position: "relative", overflow: "hidden",
        }}>
            {/* Accent top bar */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "3px",
                background: status === "Critical" ? "#ef4444" : status === "Warning" ? "#f59e0b" : "#22c55e",
                borderRadius: "16px 16px 0 0",
            }} />

            {/* Header row */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                {/* Icon */}
                <div style={{
                    width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0,
                    background: isDark ? "#1a1a22" : "#eef2ff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#6366f1",
                }}>
                    <FileIcon />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: textPri, fontFamily: fontBody, fontSize: "14px", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {machine.name || `Machine ${machine.id}`}
                    </div>
                    <div style={{ fontSize: "10px", color: textMut, fontFamily: fontMono }}>
                        ID: {machine.id}
                    </div>
                </div>
                <StatusPill status={status} />
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <Chip label="Sensors" val={sKeys.length} bg={chipBg} col={textPri} mut={textMut} fontBody={fontBody} />
                <Chip label="Issues" val={critCount > 0 ? `${critCount} 🔴` : "0"} bg={chipBg} col={critCount > 0 ? "#ef4444" : "#22c55e"} mut={textMut} fontBody={fontBody} />
                <Chip label="State" val={opStatus} bg={chipBg} col="#6366f1" mut={textMut} fontBody={fontBody} />
            </div>

            {/* Sensor chips (up to 6) */}
            {sKeys.length > 0 && (
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {sKeys.slice(0, 6).map(k => {
                        const v = sensors[k];
                        const UNITS = { temperature: "°C", humidity: "%", power: "kW", pressure: "bar", gas: "ppm", vibration: "mm/s", current: "A", voltage: "V", fuel: "%", rpm: "RPM", cpuTemp: "°C", load: "%" };
                        return (
                            <span key={k} style={{
                                background: chipBg, padding: "3px 9px", borderRadius: "6px",
                                fontSize: "11px", fontFamily: fontMono, color: textPri,
                            }}>
                                <span style={{ color: textMut, marginRight: "3px", fontSize: "10px" }}>
                                    {k === "cpuTemp" ? "CPU°" : k.charAt(0).toUpperCase() + k.slice(1)}
                                </span>
                                {typeof v === "number" ? v.toFixed(1) : v}{UNITS[k] || ""}
                            </span>
                        );
                    })}
                    {sKeys.length > 6 && (
                        <span style={{ fontSize: "11px", color: textMut, fontFamily: fontBody, display: "flex", alignItems: "center" }}>
                            +{sKeys.length - 6} more
                        </span>
                    )}
                </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                        background: downloading ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)",
                        border: `1px solid ${downloading ? "rgba(16,185,129,0.5)" : "rgba(16,185,129,0.3)"}`,
                        borderRadius: "10px", padding: "9px 16px",
                        color: "#10b981", fontSize: "12px", fontWeight: 700, fontFamily: fontBody,
                        cursor: downloading ? "default" : "pointer",
                        transition: "all 0.15s",
                    }}
                >
                    <DownloadIcon />
                    {downloading ? "Opening…" : "Download PDF"}
                </button>
                <button
                    onClick={e => { e.stopPropagation(); onView(); }}
                    style={{
                        padding: "9px 16px", borderRadius: "10px",
                        background: "transparent",
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#dde3f0"}`,
                        color: textMut, fontSize: "12px", fontWeight: 600, fontFamily: fontBody,
                        cursor: "pointer", transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#818cf8"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "#dde3f0"; e.currentTarget.style.color = textMut; }}
                >
                    View →
                </button>
            </div>
        </div>
    );
}

function Chip({ label, val, bg, col, mut, fontBody }) {
    return (
        <span style={{ background: bg, borderRadius: "7px", padding: "4px 10px", fontSize: "11px", fontFamily: fontBody }}>
            <span style={{ color: mut, marginRight: "4px" }}>{label}:</span>
            <span style={{ color: col, fontWeight: 700 }}>{val}</span>
        </span>
    );
}

export default function ReportsPage() {
    const { colors: c, isDark } = useTheme();
    const { userMachines, isHidden } = useMachines();
    const { getMachineLimits } = useAlerts();
    const navigate = useNavigate();

    const [socketMachines, setSocketMachines] = useState([]);
    const [downloading, setDownloading] = useState(false);
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        socket.on("machines", data => setSocketMachines(Object.values(data)));
        return () => socket.off("machines");
    }, []);

    const all = useMemo(() => [
        ...socketMachines.filter(m => !isHidden(String(m.id))),
        ...userMachines,
    ], [socketMachines, userMachines, isHidden]);

    const filtered = useMemo(() => {
        if (filter === "All") return all;
        return all.filter(m => (m.condition || m.status || "Normal") === filter);
    }, [all, filter]);

    const counts = useMemo(() => {
        const r = { All: all.length, Normal: 0, Warning: 0, Critical: 0 };
        all.forEach(m => { const s = m.condition || m.status || "Normal"; if (s in r) r[s]++; });
        return r;
    }, [all]);

    const critCount = counts.Critical;
    const warnCount = counts.Warning;

    const bg = isDark ? "#07070a" : "#f5f6fb";
    const border = isDark ? "#1a1a1f" : "#e2e8f0";
    const textPri = isDark ? "#f0f2fc" : "#0f172a";
    const textMut = isDark ? "#64748b" : "#94a3b8";
    const fontBody = c.fontBody || '"Plus Jakarta Sans",sans-serif';
    const fontMono = c.fontMono || '"Roboto Mono",monospace';

    function downloadAll() {
        setDownloading(true);
        let delay = 0;
        filtered.forEach(m => {
            setTimeout(() => {
                generateMachinePDF({
                    machineName: m.name || `Machine ${m.id}`,
                    machineId: String(m.id),
                    status: m.condition || m.status || "Normal",
                    opStatus: m.operationalStatus || m.opStatus || "Active",
                    runtimeHours: m.runtime || 0,
                    sensors: m.sensors || {},
                    sensorStatus: m.sensorStatus || {},
                    limits: getMachineLimits(String(m.id)),
                });
            }, delay);
            delay += 500; // stagger to avoid popup blocker
        });
        setTimeout(() => setDownloading(false), delay + 500);
    }

    const FILTER_TABS = ["All", "Normal", "Warning", "Critical"];
    const tabColors = { All: "#6366f1", Normal: "#22c55e", Warning: "#f59e0b", Critical: "#ef4444" };

    return (
        <div style={{ background: bg, minHeight: "100vh" }}>
            <Sidebar />
            <main style={{ padding: "28px 32px" }}>

                {/* ── Page header ── */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: "22px", fontWeight: 800, color: textPri, fontFamily: c.fontHeading, letterSpacing: "-0.03em", margin: "0 0 4px" }}>
                            Reports
                        </h1>
                        <div style={{ fontSize: "12px", color: textMut, fontFamily: fontBody }}>
                            Generate & download detailed PDF reports for any monitored machine
                        </div>
                    </div>

                    {/* Download All button */}
                    {all.length > 0 && (
                        <button
                            onClick={downloadAll}
                            disabled={downloading}
                            style={{
                                display: "flex", alignItems: "center", gap: "8px",
                                background: "rgba(99,102,241,0.1)",
                                border: "1px solid rgba(99,102,241,0.35)",
                                borderRadius: "12px", padding: "10px 20px",
                                color: "#818cf8", fontSize: "13px", fontWeight: 700, fontFamily: fontBody,
                                cursor: downloading ? "default" : "pointer",
                                transition: "all 0.15s",
                            }}
                        >
                            <AllIcon />
                            {downloading ? `Opening ${filtered.length} reports…` : `Download All (${filtered.length})`}
                        </button>
                    )}
                </div>

                {/* ── Alert banner if critical machines ── */}
                {critCount > 0 && (
                    <div style={{
                        background: "rgba(239,68,68,0.06)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: "12px", padding: "12px 18px",
                        marginBottom: "20px",
                        display: "flex", alignItems: "center", gap: "10px",
                    }}>
                        <span style={{ fontSize: "16px" }}>🚨</span>
                        <span style={{ fontFamily: fontBody, color: "#f87171", fontSize: "13px", fontWeight: 600 }}>
                            {critCount} machine{critCount > 1 ? "s" : ""} in <strong>Critical</strong> state
                            {warnCount > 0 ? ` and ${warnCount} in Warning state` : ""} — download their reports for a full breakdown.
                        </span>
                    </div>
                )}

                {/* ── Filter tabs ── */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
                    {FILTER_TABS.map(f => {
                        const active = filter === f;
                        const col = tabColors[f];
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

                {/* ── Machine grid ── */}
                {filtered.length === 0 ? (
                    <div style={{
                        textAlign: "center", padding: "72px 24px",
                        color: textMut, fontFamily: fontBody,
                    }}>
                        <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: textPri, marginBottom: "6px" }}>No machines to report on</div>
                        <div style={{ fontSize: "13px" }}>
                            {all.length === 0 ? "Add machines from the Dashboard first." : "No machines match this filter."}
                        </div>
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
                        gap: "16px",
                    }}>
                        {filtered.map((m, i) => (
                            <ReportCard
                                key={m.id || i}
                                machine={m}
                                isDark={isDark}
                                fontBody={fontBody} fontMono={fontMono}
                                textPri={textPri} textMut={textMut}
                                border={border}
                                limits={getMachineLimits(String(m.id))}
                                onView={() => navigate(`/machine/${m.id}`)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
