import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAlerts } from "../context/AlertsContext";
import { useTheme } from "../context/ThemeContext";

const SENSOR_LABEL = {
    temperature: "Temperature", humidity: "Humidity", power: "Power",
    pressure: "Pressure", gas: "Gas", vibration: "Vibration",
    current: "Current", voltage: "Voltage", fuel: "Fuel",
    rpm: "RPM", cpuTemp: "CPU Temp", load: "Load",
};

const COND_STYLES = {
    Critical: { pill: "#fee2e2", pillText: "#7f1d1d", dot: "#ef4444", glow: "rgba(239,68,68,0.18)" },
    Warning: { pill: "#fef3c7", pillText: "#78350f", dot: "#f59e0b", glow: "rgba(245,158,11,0.14)" },
};

function timeAgo(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
}

const BellOffIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        <path d="M18.63 13A17.89 17.89 0 0 1 18 8" />
        <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" />
        <path d="M18 8a6 6 0 0 0-9.33-5" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const TrashIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
        <path d="M9 6V4h6v2" />
    </svg>
);

export default function AlertsPage() {
    const { alerts, clearAlert, clearAllAlerts, markAllRead, unreadCount } = useAlerts();
    const { colors: c, isDark } = useTheme();
    const navigate = useNavigate();

    // Mark all read when page opens
    useEffect(() => { markAllRead(); }, []);

    const pageBg = isDark ? "transparent" : "transparent";

    return (
        <div style={{ background: pageBg, minHeight: "100vh" }}>
            <Sidebar />
            <main style={{ padding: "32px 36px", minWidth: 0 }}>

                {/* ── Header ─────────────────────────────────────── */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: 800, color: c.textPrimary, fontFamily: c.fontHeading, letterSpacing: "-0.03em", margin: 0 }}>
                        Alerts
                    </h2>
                    {alerts.length > 0 && (
                        <span style={{
                            fontSize: "10px", fontWeight: 700, padding: "3px 9px", borderRadius: "999px",
                            background: "#fee2e2", color: "#7f1d1d",
                            textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: c.fontBody,
                        }}>
                            {alerts.length} total
                        </span>
                    )}
                    <div style={{ flex: 1 }} />
                    {alerts.length > 0 && (
                        <button
                            onClick={clearAllAlerts}
                            style={{
                                background: isDark ? "rgba(239,68,68,0.07)" : "rgba(239,68,68,0.06)",
                                border: "1px solid rgba(239,68,68,0.2)",
                                color: "#f87171", borderRadius: "9px", padding: "7px 16px",
                                fontSize: "12px", fontWeight: 700, fontFamily: c.fontBody, cursor: "pointer",
                                transition: "background 0.15s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.14)"}
                            onMouseLeave={e => e.currentTarget.style.background = isDark ? "rgba(239,68,68,0.07)" : "rgba(239,68,68,0.06)"}
                        >
                            Clear All
                        </button>
                    )}
                </div>

                {/* ── Empty state ─────────────────────────────────── */}
                {alerts.length === 0 && (
                    <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        minHeight: "50vh", gap: "16px",
                    }}>
                        <div style={{ color: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)" }}>
                            <BellOffIcon />
                        </div>
                        <p style={{ fontSize: "15px", fontWeight: 600, color: c.textMuted, fontFamily: c.fontBody, margin: 0 }}>
                            No alerts yet
                        </p>
                        <p style={{ fontSize: "12px", color: c.textMuted, fontFamily: c.fontBody, margin: 0, opacity: 0.6, textAlign: "center", maxWidth: 260 }}>
                            Set sensor limits on a machine's detail page and you'll see alerts here when they're exceeded.
                        </p>
                        <button
                            onClick={() => navigate("/dashboard")}
                            style={{
                                background: "#4f46e5", border: "none", color: "#fff", borderRadius: "999px",
                                padding: "9px 22px", fontSize: "13px", fontWeight: 700, fontFamily: c.fontBody,
                                cursor: "pointer", boxShadow: "0 4px 14px rgba(79,70,229,0.4)",
                            }}
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}

                {/* ── Alert list ─────────────────────────────────── */}
                {alerts.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {alerts.map(alert => {
                            const cs = COND_STYLES[alert.condition] || COND_STYLES.Warning;
                            const sLabel = SENSOR_LABEL[alert.sensor] || alert.sensor;
                            return (
                                <AlertRow
                                    key={alert.id}
                                    alert={alert}
                                    cs={cs}
                                    sLabel={sLabel}
                                    c={c}
                                    isDark={isDark}
                                    onDismiss={() => clearAlert(alert.id)}
                                    onViewMachine={() => navigate(`/machine/${alert.machineId}`)}
                                />
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

function AlertRow({ alert, cs, sLabel, c, isDark, onDismiss, onViewMachine }) {
    const cardBg = isDark ? "#0d0d10" : "#f7f8fc";
    const cardBorder = isDark ? "#1e1e22" : "#dde3f0";

    return (
        <div style={{
            display: "flex", alignItems: "center", gap: "14px",
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderLeft: `3px solid ${cs.dot}`,
            borderRadius: "14px",
            padding: "14px 18px",
            boxShadow: isDark ? `0 0 18px ${cs.glow}` : "0 2px 10px rgba(20,24,44,0.06)",
            transition: "box-shadow 0.2s",
        }}>
            {/* Condition dot */}
            <div style={{
                width: "10px", height: "10px", borderRadius: "50%",
                background: cs.dot, flexShrink: 0,
                boxShadow: `0 0 6px ${cs.dot}`,
                animation: alert.condition === "Critical" ? "alertPulse 1.8s ease-in-out infinite" : "none",
            }} />

            {/* Details */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: c.textPrimary, fontFamily: c.fontHeading }}>
                        {alert.machineName}
                    </span>
                    <span style={{
                        background: cs.pill, color: cs.pillText,
                        fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px",
                        letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: c.fontBody,
                    }}>
                        {alert.condition}
                    </span>
                </div>
                <div style={{ fontSize: "12px", color: c.textMuted, fontFamily: c.fontBody, marginTop: "3px" }}>
                    <span style={{ color: cs.dot, fontWeight: 700 }}>{sLabel}</span>
                    {" · "}
                    <span style={{ fontFamily: c.fontMono, fontWeight: 600 }}>{alert.value.toFixed(1)}{alert.unit}</span>
                    <span style={{ opacity: 0.6 }}> exceeded limit of </span>
                    <span style={{ fontFamily: c.fontMono, fontWeight: 600 }}>{alert.limit}{alert.unit}</span>
                </div>
            </div>

            {/* Time */}
            <div style={{ fontSize: "11px", color: c.textMuted, fontFamily: c.fontMono, flexShrink: 0, whiteSpace: "nowrap" }}>
                {timeAgo(alert.timestamp)}
            </div>

            {/* View machine link */}
            <button onClick={onViewMachine} style={{
                background: "transparent", border: `1px solid ${isDark ? "#2a2a2a" : "#dde3f0"}`,
                color: c.textMuted, borderRadius: "7px", padding: "5px 10px",
                fontSize: "11px", fontFamily: c.fontBody, cursor: "pointer",
                whiteSpace: "nowrap", flexShrink: 0, transition: "background 0.15s, color 0.15s",
            }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.1)"; e.currentTarget.style.color = "#6366f1"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.textMuted; }}
            >
                View →
            </button>

            {/* Dismiss */}
            <button onClick={onDismiss} style={{
                background: "transparent", border: "1px solid rgba(239,68,68,0.2)",
                color: "#f87171", borderRadius: "7px", padding: "5px 7px",
                cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0,
                transition: "background 0.15s",
            }}
                title="Dismiss"
                onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
                <TrashIcon />
            </button>

            <style>{`@keyframes alertPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.4)}}`}</style>
        </div>
    );
}
