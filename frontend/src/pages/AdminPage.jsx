import { useState, useEffect, useCallback, useRef } from "react";

const API = "https://fsocity.onrender.com/";
const ADMIN_PWD = import.meta.env.VITE_ADMIN_PASSWORD;

// ── Color constants matching fsociety dark theme ──────────────────────────────
const BG = "#060608";
const CARD = "rgba(255,255,255,0.028)";
const BORDER = "rgba(255,255,255,0.07)";
const ACCENT = "#e8192c";
const TEXT = "#f0f2fc";
const MUTED = "rgba(220,225,255,0.42)";
const FONT = '"Plus Jakarta Sans", sans-serif';
const MONO = '"JetBrains Mono", "Fira Code", monospace';

const STATUS_COLOR = { Normal: "#34d399", Warning: "#f59e0b", Critical: "#e8192c" };
const STATUS_BG = { Normal: "rgba(52,211,153,0.1)", Warning: "rgba(245,158,11,0.1)", Critical: "rgba(232,25,44,0.1)" };

// ── SVG icon set ─────────────────────────────────────────────────────────────
const I = {
    Lock: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    Eye: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    EyeOff: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>,
    Grid: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
    Users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    Machine: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
    Sensor: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    Settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    Alert: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    Refresh: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>,
    Trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>,
    Mail: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
    Megaphone: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 11l19-9-9 19-2-8-8-2z" /></svg>,
    X: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    Check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>,
    Search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    Clock: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    Server: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>,
};

// ── Helper ────────────────────────────────────────────────────────────────────
function fmtUptime(s) {
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}
function companyFrom(email) {
    const d = (email || "").split("@")[1] || "";
    const n = d.split(".")[0] || "Unknown";
    return n[0].toUpperCase() + n.slice(1);
}
function avatarColor(str) {
    const colors = ["#e8192c", "#60a5fa", "#34d399", "#f59e0b", "#a78bfa", "#f472b6"];
    let h = 0;
    for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
    return colors[Math.abs(h) % colors.length];
}

// ── Shared micro-components ───────────────────────────────────────────────────
function Badge({ label, color, bg }) {
    return (
        <span style={{
            fontSize: 10, fontWeight: 700, color, background: bg || `${color}18`,
            border: `1px solid ${color}30`, borderRadius: 999, padding: "3px 10px",
            letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap"
        }}>
            {label}
        </span>
    );
}

function Spinner() {
    return (
        <span style={{
            display: "inline-flex", width: 14, height: 14,
            border: "2px solid rgba(255,255,255,0.12)", borderTopColor: ACCENT,
            borderRadius: "50%", animation: "spin .65s linear infinite"
        }} />
    );
}

// ── PASSWORD GATE ─────────────────────────────────────────────────────────────
function PasswordGate({ onUnlock }) {
    const [pw, setPw] = useState("");
    const [show, setShow] = useState(false);
    const [err, setErr] = useState("");
    const [shake, setShake] = useState(false);

    function attempt() {
        if (pw === ADMIN_PWD) { onUnlock(); }
        else {
            setErr("Incorrect admin password.");
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    }

    return (
        <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
            <div style={{
                width: 380, background: "rgba(255,255,255,0.025)",
                border: `1px solid ${BORDER}`, borderRadius: 20, padding: "40px 36px",
                boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
                animation: shake ? "shake .4s ease" : "none",
            }}>
                {/* icon */}
                <div style={{
                    width: 52, height: 52, borderRadius: "50%", background: "rgba(232,25,44,0.12)",
                    color: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px"
                }}>
                    {I.Lock}
                </div>

                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: TEXT, letterSpacing: "-0.03em" }}>Admin Access</div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>Restricted to authorised personnel</div>
                </div>

                <div style={{ position: "relative", marginBottom: 10 }}>
                    <input
                        type={show ? "text" : "password"}
                        placeholder="Admin password"
                        value={pw}
                        onChange={e => { setPw(e.target.value); setErr(""); }}
                        onKeyDown={e => e.key === "Enter" && attempt()}
                        autoFocus
                        style={{
                            width: "100%", boxSizing: "border-box",
                            background: "rgba(255,255,255,0.04)",
                            border: `1.5px solid ${err ? "#e8192c" : BORDER}`,
                            borderRadius: 10, padding: "12px 42px 12px 14px",
                            fontSize: 13, fontFamily: FONT, color: TEXT, outline: "none",
                        }}
                    />
                    <button onClick={() => setShow(s => !s)} style={{
                        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer", color: MUTED, display: "flex",
                    }}>{show ? I.EyeOff : I.Eye}</button>
                </div>

                {err && <div style={{ fontSize: 11.5, color: "#e8192c", marginBottom: 12 }}>{err}</div>}

                <button onClick={attempt} style={{
                    width: "100%", background: ACCENT, border: "none", color: "#fff",
                    borderRadius: 10, padding: "13px 0", fontSize: 13.5, fontWeight: 800,
                    fontFamily: FONT, cursor: "pointer", boxShadow: "0 4px 20px rgba(232,25,44,0.35)",
                    transition: "opacity .15s",
                }}
                    onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                    Unlock Dashboard
                </button>
            </div>
            <style>{`
        @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        input::placeholder{color:rgba(220,225,255,0.25);}
        input{transition:border-color .15s;}
        input:focus{border-color:rgba(232,25,44,0.5)!important;}
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px;}
      `}</style>
        </div>
    );
}

// ── CONFIRM MODAL ─────────────────────────────────────────────────────────────
function ConfirmModal({ title, body, onConfirm, onCancel, danger = true }) {
    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={onCancel}>
            <div style={{
                background: "#0e0e14", border: `1px solid ${BORDER}`, borderRadius: 16,
                padding: "28px 28px 24px", width: 380, boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
            }} onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: 16, fontWeight: 800, color: TEXT, marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, marginBottom: 24 }}>{body}</div>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={onCancel} style={{
                        background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 9,
                        color: MUTED, padding: "9px 20px", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer",
                    }}>Cancel</button>
                    <button onClick={onConfirm} style={{
                        background: danger ? ACCENT : "#34d399",
                        border: "none", borderRadius: 9, color: "#fff",
                        padding: "9px 20px", fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: "pointer",
                        boxShadow: danger ? "0 4px 16px rgba(232,25,44,0.3)" : "none",
                    }}>Confirm</button>
                </div>
            </div>
        </div>
    );
}

// ── MAIN ADMIN DASHBOARD ──────────────────────────────────────────────────────
const TABS = [
    { id: "overview", label: "Overview", icon: I.Grid },
    { id: "users", label: "Users", icon: I.Users },
    { id: "machines", label: "Machines", icon: I.Machine },
    { id: "sensors", label: "Sensor Health", icon: I.Sensor },
    { id: "system", label: "System", icon: I.Settings },
];

const SENSOR_RANGES = {
    temperature: [0, 200], humidity: [0, 100], power: [0, 10], pressure: [0, 150],
    gas: [0, 10], vibration: [0, 50], current: [0, 50], voltage: [180, 260], fuel: [0, 100],
    rpm: [0, 3000], cpuTemp: [20, 120], load: [0, 100],
};
const SENSOR_UNITS = {
    temperature: "°C", humidity: "%", power: "kW", pressure: "bar", gas: "ppm",
    vibration: "mm/s", current: "A", voltage: "V", fuel: "%", rpm: "RPM", cpuTemp: "°C", load: "%",
};

function sensorPct(key, val) {
    const r = SENSOR_RANGES[key] || [0, 100];
    return Math.max(0, Math.min(100, ((val - r[0]) / (r[1] - r[0])) * 100));
}

function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(null);
    const [tab, setTab] = useState("overview");

    // Users tab state
    const [search, setSearch] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // System tab state
    const [bcastInput, setBcastInput] = useState("");
    const [bcastSending, setBcastSending] = useState(false);
    const [bcastDone, setBcastDone] = useState(false);

    const autoRef = useRef(null);

    const fetchData = useCallback(async () => {
        try {
            const r = await fetch(`${API}/api/admin/data`, {
                headers: { "x-admin-password": ADMIN_PWD },
            });
            if (!r.ok) throw new Error("Unauthorized or server error");
            const j = await r.json();
            setData(j);
            setLastFetch(new Date());
            setError(null);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => { fetchData(); }, [fetchData]);

    // Auto-refresh every 5 seconds when on machines / sensors / overview
    useEffect(() => {
        if (["overview", "machines", "sensors"].includes(tab)) {
            autoRef.current = setInterval(fetchData, 5000);
        }
        return () => clearInterval(autoRef.current);
    }, [tab, fetchData]);

    // ── derived ──────────────────────────────────────────────────────────────
    const machines = data?.machines ?? [];
    const users = data?.users ?? [];
    const broadcast = data?.broadcast;
    const uptime = data?.uptimeSeconds ?? 0;
    const totalSensors = machines.reduce((s, m) => s + Object.keys(m.sensors || {}).length, 0);
    const critCount = machines.filter(m => m.status === "Critical").length;
    const warnCount = machines.filter(m => m.status === "Warning").length;

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    // ── delete user ───────────────────────────────────────────────────────────
    async function deleteUser(id) {
        setDeleting(true);
        try {
            await fetch(`${API}/api/admin/user/${id}`, {
                method: "DELETE",
                headers: { "x-admin-password": ADMIN_PWD },
            });
            await fetchData();
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    }

    // ── send broadcast ────────────────────────────────────────────────────────
    async function sendBroadcast(text) {
        setBcastSending(true);
        await fetch(`${API}/api/admin/broadcast`, {
            method: "POST",
            headers: { "x-admin-password": ADMIN_PWD, "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        });
        await fetchData();
        setBcastSending(false);
        setBcastDone(true);
        setTimeout(() => setBcastDone(false), 2500);
    }

    // ── stat card ─────────────────────────────────────────────────────────────
    function StatCard({ icon, label, value, color, sub }) {
        return (
            <div style={{
                background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14,
                padding: "18px 20px", display: "flex", alignItems: "center", gap: 16
            }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: `${color}14`, border: `1px solid ${color}25`,
                    color, display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    {icon}
                </div>
                <div>
                    <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: MONO, lineHeight: 1, letterSpacing: "-0.04em" }}>{value}</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{label}</div>
                    {sub && <div style={{ fontSize: 10, color: "rgba(220,225,255,0.22)", marginTop: 1 }}>{sub}</div>}
                </div>
            </div>
        );
    }

    // ── status indicator dot ──────────────────────────────────────────────────
    function StatusDot({ status }) {
        const col = STATUS_COLOR[status] || "#6366f1";
        return <span style={{
            width: 7, height: 7, borderRadius: "50%", background: col,
            display: "inline-block", flexShrink: 0,
            boxShadow: status !== "Normal" ? `0 0 6px ${col}` : "none"
        }} />;
    }

    // ── loading / error states ────────────────────────────────────────────────
    if (loading && !data) return (
        <div style={{
            minHeight: "100vh", background: BG, display: "flex", alignItems: "center",
            justifyContent: "center", gap: 12, color: MUTED, fontFamily: FONT
        }}>
            <Spinner /> Loading admin data…
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    if (error) return (
        <div style={{
            minHeight: "100vh", background: BG, display: "flex", alignItems: "center",
            justifyContent: "center", flexDirection: "column", gap: 12, color: MUTED, fontFamily: FONT, textAlign: "center"
        }}>
            <div style={{ color: "#e8192c" }}>{I.Alert}</div>
            <div style={{ fontWeight: 700, color: TEXT }}>{error}</div>
            <div style={{ fontSize: 12 }}>Is the backend running on port 5000?</div>
            <button onClick={fetchData} style={{
                background: ACCENT, border: "none", color: "#fff", borderRadius: 9,
                padding: "9px 22px", fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer", marginTop: 4,
            }}>Retry</button>
        </div>
    );


    // ══════════════════════════════════════════════════════════════════════════
    return (
        <div style={{ display: "flex", minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT }}>

            {/* ── Sidebar ── */}
            <aside style={{
                width: 220, flexShrink: 0, background: "rgba(255,255,255,0.015)",
                borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column",
                position: "sticky", top: 0, height: "100vh", overflow: "hidden",
            }}>
                {/* Logo */}
                <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: TEXT, letterSpacing: "-0.04em" }}>fsociety</div>
                    <div style={{ fontSize: 10, color: ACCENT, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>Admin Panel</div>
                </div>

                {/* Nav links */}
                <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
                            fontFamily: FONT, fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
                            background: tab === t.id ? "rgba(232,25,44,0.1)" : "transparent",
                            color: tab === t.id ? ACCENT : MUTED,
                            transition: "all .15s", textAlign: "left",
                        }}>
                            {t.icon}
                            {t.label}
                            {t.id === "machines" && critCount > 0 && (
                                <span style={{
                                    marginLeft: "auto", background: "#e8192c", color: "#fff",
                                    borderRadius: 999, padding: "1px 7px", fontSize: 10, fontWeight: 800
                                }}>
                                    {critCount}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Footer info */}
                <div style={{ padding: "14px 16px", borderTop: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 10, color: "rgba(220,225,255,0.2)", lineHeight: 1.6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            {I.Clock}
                            <span>Uptime: {fmtUptime(uptime)}</span>
                        </div>
                        {lastFetch && (
                            <div style={{ marginTop: 3 }}>
                                Refreshed {lastFetch.toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* ── Main area ── */}
            <main style={{ flex: 1, padding: "32px 36px", overflow: "auto" }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.04em", color: TEXT }}>
                            {TABS.find(t => t.id === tab)?.label}
                        </div>
                        <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                            {data?.generatedAt ? `Data as of ${new Date(data.generatedAt).toLocaleTimeString()}` : ""}
                        </div>
                    </div>
                    <div style={{ flex: 1 }} />
                    <button onClick={fetchData} style={{
                        display: "flex", alignItems: "center", gap: 7,
                        background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`,
                        borderRadius: 9, color: MUTED, padding: "8px 16px",
                        fontSize: 12, fontWeight: 600, fontFamily: FONT, cursor: "pointer",
                        transition: "border-color .15s, color .15s",
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.color = TEXT; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = MUTED; }}
                    >
                        {I.Refresh}
                        Refresh
                    </button>
                </div>

                {/* Broadcast banner */}
                {broadcast && (
                    <div style={{
                        background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
                        borderRadius: 12, padding: "12px 18px", marginBottom: 20,
                        display: "flex", alignItems: "center", gap: 12, fontSize: 13,
                    }}>
                        <span style={{ color: "#f59e0b", flexShrink: 0 }}>{I.Alert}</span>
                        <span style={{ flex: 1, color: "rgba(245,158,11,0.9)", fontWeight: 600 }}>{broadcast.text}</span>
                        <button onClick={() => sendBroadcast("")} style={{
                            background: "none", border: "none", cursor: "pointer", color: "rgba(245,158,11,0.5)", display: "flex",
                        }}>{I.X}</button>
                    </div>
                )}

                {/* ══ OVERVIEW TAB ══ */}
                {tab === "overview" && (
                    <div>
                        {/* KPI row */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 28 }}>
                            <StatCard icon={I.Users} label="Registered Users" value={users.length} color="#60a5fa" />
                            <StatCard icon={I.Machine} label="Live Machines" value={machines.length} color="#34d399" sub="simulated telemetry" />
                            <StatCard icon={I.Sensor} label="Active Sensors" value={totalSensors} color="#a78bfa" />
                            <StatCard icon={I.Alert} label="Critical Alerts" value={critCount} color="#e8192c" />
                            <StatCard icon={I.Alert} label="Warnings" value={warnCount} color="#f59e0b" />
                            <StatCard icon={I.Server} label="Server Uptime" value={fmtUptime(uptime)} color="#38bdf8" />
                        </div>

                        {/* Machine status list */}
                        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
                            <div style={{
                                padding: "14px 18px", borderBottom: `1px solid ${BORDER}`,
                                display: "flex", justifyContent: "space-between", alignItems: "center"
                            }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Machine Status Overview</span>
                                <span style={{ fontSize: 11, color: MUTED }}>Updates every 5s</span>
                            </div>
                            {machines.map((m, i) => (
                                <div key={m.id} style={{
                                    display: "flex", alignItems: "center", gap: 14,
                                    padding: "13px 18px",
                                    borderBottom: i < machines.length - 1 ? `1px solid ${BORDER}` : "none",
                                }}>
                                    <StatusDot status={m.status} />
                                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: TEXT }}>{m.name}</span>
                                    <span style={{ fontSize: 11, color: MUTED, fontFamily: MONO }}>
                                        {Object.keys(m.sensors || {}).length} sensors
                                    </span>
                                    <Badge label={m.status} color={STATUS_COLOR[m.status]} bg={STATUS_BG[m.status]} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ══ USERS TAB ══ */}
                {tab === "users" && (
                    <div>
                        {/* Search */}
                        <div style={{ position: "relative", marginBottom: 16, maxWidth: 360 }}>
                            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: MUTED }}>
                                {I.Search}
                            </span>
                            <input
                                value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search by name or email…"
                                style={{
                                    width: "100%", background: "rgba(255,255,255,0.04)",
                                    border: `1px solid ${BORDER}`, borderRadius: 10,
                                    padding: "10px 14px 10px 36px", fontSize: 13, fontFamily: FONT, color: TEXT,
                                    outline: "none",
                                }}
                            />
                        </div>

                        {/* Table */}
                        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
                            {/* Header */}
                            <div style={{
                                display: "grid", gridTemplateColumns: "1fr 1fr 160px 48px",
                                padding: "10px 18px", borderBottom: `1px solid ${BORDER}`,
                                fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em"
                            }}>
                                <span>Name</span>
                                <span>Email</span>
                                <span>User ID</span>
                                <span></span>
                            </div>

                            {filteredUsers.length === 0 && (
                                <div style={{ padding: "40px 18px", textAlign: "center", color: MUTED, fontSize: 13 }}>
                                    {search ? "No users match your search." : "No registered users yet."}
                                </div>
                            )}

                            {filteredUsers.map((u, i) => {
                                const col = avatarColor(u.name || u.email);
                                return (
                                    <div key={u.id} style={{
                                        display: "grid", gridTemplateColumns: "1fr 1fr 160px 48px",
                                        alignItems: "center", padding: "12px 18px",
                                        borderBottom: i < filteredUsers.length - 1 ? `1px solid ${BORDER}` : "none",
                                        transition: "background .15s",
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        {/* Name + avatar */}
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div style={{
                                                width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                                                background: `${col}22`, border: `1px solid ${col}44`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 11, fontWeight: 800, color: col
                                            }}>
                                                {(u.name || "?")[0].toUpperCase()}
                                            </div>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{u.name}</span>
                                        </div>
                                        {/* Email */}
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: MUTED }}>
                                            {I.Mail} {u.email}
                                        </div>
                                        {/* ID */}
                                        <div style={{ fontSize: 10.5, color: "rgba(220,225,255,0.2)", fontFamily: MONO }}>{u.id}</div>
                                        {/* Delete */}
                                        <button onClick={() => setDeleteTarget(u)} style={{
                                            background: "transparent", border: "none", cursor: "pointer",
                                            color: "rgba(232,25,44,0.45)", display: "flex", alignItems: "center",
                                            padding: 6, borderRadius: 7, transition: "color .15s, background .15s",
                                        }}
                                            onMouseEnter={e => { e.currentTarget.style.color = "#e8192c"; e.currentTarget.style.background = "rgba(232,25,44,0.12)"; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = "rgba(232,25,44,0.45)"; e.currentTarget.style.background = "transparent"; }}
                                        >{I.Trash}</button>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ fontSize: 11, color: MUTED, marginTop: 10 }}>
                            {filteredUsers.length} of {users.length} user{users.length !== 1 ? "s" : ""}
                        </div>
                    </div>
                )}

                {/* ══ MACHINES TAB ══ */}
                {tab === "machines" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {machines.map(m => {
                            const sc = STATUS_COLOR[m.status];
                            const sb = STATUS_BG[m.status];
                            const sKeys = Object.keys(m.sensors || {});
                            return (
                                <div key={m.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
                                    {/* Machine header */}
                                    <div style={{
                                        padding: "16px 20px", borderBottom: `1px solid ${BORDER}`,
                                        display: "flex", alignItems: "center", gap: 14
                                    }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 11, background: sb,
                                            border: `1px solid ${sc}30`, color: sc,
                                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                        }}>
                                            {I.Machine}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 14, fontWeight: 800, color: TEXT, letterSpacing: "-0.02em" }}>{m.name}</div>
                                            <div style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>
                                                ID {m.id} · {sKeys.length} sensor{sKeys.length !== 1 ? "s" : ""}
                                                {m.lastUpdated && ` · ${new Date(m.lastUpdated).toLocaleTimeString()}`}
                                            </div>
                                        </div>
                                        <Badge label={m.status} color={sc} bg={sb} />
                                    </div>
                                    {/* Sensor grid */}
                                    <div style={{
                                        padding: "16px 20px",
                                        display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12
                                    }}>
                                        {sKeys.map(k => {
                                            const val = m.sensors[k];
                                            const st = m.sensorStatus?.[k] || "Normal";
                                            const col = STATUS_COLOR[st];
                                            const pct = sensorPct(k, val);
                                            const unit = SENSOR_UNITS[k] || "";
                                            return (
                                                <div key={k}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
                                                        <span style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em" }}>{k}</span>
                                                        <span style={{ fontSize: 12, fontWeight: 800, color: col, fontFamily: MONO }}>
                                                            {typeof val === "number" ? val.toFixed(1) : val}{unit}
                                                        </span>
                                                    </div>
                                                    <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                                                        <div style={{
                                                            height: "100%", width: `${pct}%`, background: col,
                                                            borderRadius: 3, transition: "width .7s ease", boxShadow: `0 0 6px ${col}55`
                                                        }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ══ SENSOR HEALTH TAB ══ */}
                {tab === "sensors" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {machines.map(m => {
                            const sKeys = Object.keys(m.sensors || {});
                            const hasCrit = Object.values(m.sensorStatus || {}).includes("Critical");
                            const hasWarn = Object.values(m.sensorStatus || {}).includes("Warning");
                            const macColor = hasCrit ? "#e8192c" : hasWarn ? "#f59e0b" : "#34d399";
                            return (
                                <div key={m.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 20px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                                        <StatusDot status={m.status} />
                                        <span style={{ fontSize: 14, fontWeight: 800, color: TEXT, flex: 1 }}>{m.name}</span>
                                        <Badge label={m.status} color={STATUS_COLOR[m.status]} bg={STATUS_BG[m.status]} />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                        {sKeys.map(k => {
                                            const val = m.sensors[k];
                                            const st = m.sensorStatus?.[k] || "Normal";
                                            const col = STATUS_COLOR[st];
                                            const pct = sensorPct(k, val);
                                            const unit = SENSOR_UNITS[k] || "";
                                            return (
                                                <div key={k}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                                        <span style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>{k}</span>
                                                        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: MONO }}>
                                                            <span style={{ color: col }}>{typeof val === "number" ? val.toFixed(1) : val}{unit}</span>
                                                            <span style={{ color: MUTED, fontWeight: 400, marginLeft: 6 }}>· {st}</span>
                                                        </span>
                                                    </div>
                                                    <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                                                        <div style={{
                                                            height: "100%", width: `${pct}%`, background: col,
                                                            borderRadius: 4, transition: "width .7s ease", boxShadow: `0 0 8px ${col}44`
                                                        }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ══ SYSTEM TAB ══ */}
                {tab === "system" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 620 }}>

                        {/* Broadcast panel */}
                        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
                            <div style={{
                                padding: "14px 18px", borderBottom: `1px solid ${BORDER}`,
                                display: "flex", alignItems: "center", gap: 10
                            }}>
                                <span style={{ color: ACCENT }}>{I.Megaphone}</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Broadcast Message</span>
                            </div>
                            <div style={{ padding: "18px" }}>
                                <div style={{ fontSize: 12, color: MUTED, marginBottom: 12, lineHeight: 1.6 }}>
                                    Send a banner message visible to all admin sessions. Leave blank to clear the current banner.
                                </div>

                                {/* Current banner */}
                                {broadcast ? (
                                    <div style={{
                                        background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)",
                                        borderRadius: 9, padding: "11px 14px", marginBottom: 14, fontSize: 13
                                    }}>
                                        <div style={{ color: "rgba(245,158,11,0.85)", fontWeight: 600, marginBottom: 3 }}>
                                            Active: "{broadcast.text}"
                                        </div>
                                        <div style={{ fontSize: 10, color: MUTED }}>
                                            Sent {new Date(broadcast.sentAt).toLocaleString()}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ fontSize: 12, color: "rgba(220,225,255,0.2)", marginBottom: 14 }}>No active broadcast.</div>
                                )}

                                <textarea
                                    value={bcastInput}
                                    onChange={e => setBcastInput(e.target.value)}
                                    placeholder="Type a message to broadcast…"
                                    rows={3}
                                    style={{
                                        width: "100%", background: "rgba(255,255,255,0.04)",
                                        border: `1px solid ${BORDER}`, borderRadius: 9,
                                        padding: "11px 13px", fontSize: 13, fontFamily: FONT, color: TEXT,
                                        outline: "none", resize: "vertical", marginBottom: 12, lineHeight: 1.6,
                                    }}
                                />

                                <div style={{ display: "flex", gap: 10 }}>
                                    <button
                                        onClick={() => sendBroadcast(bcastInput)}
                                        disabled={bcastSending}
                                        style={{
                                            background: bcastDone ? "#34d399" : ACCENT,
                                            border: "none", borderRadius: 9, color: "#fff",
                                            padding: "10px 20px", fontSize: 13, fontWeight: 700, fontFamily: FONT,
                                            cursor: bcastSending ? "not-allowed" : "pointer",
                                            opacity: bcastSending ? 0.7 : 1,
                                            display: "flex", alignItems: "center", gap: 8,
                                            transition: "background .3s",
                                        }}>
                                        {bcastSending ? <Spinner /> : bcastDone ? I.Check : I.Megaphone}
                                        {bcastDone ? "Sent" : "Send Broadcast"}
                                    </button>
                                    {broadcast && (
                                        <button onClick={() => sendBroadcast("")} style={{
                                            background: "transparent", border: `1px solid ${BORDER}`,
                                            borderRadius: 9, color: MUTED, padding: "10px 18px",
                                            fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer",
                                        }}>Clear Banner</button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Config info */}
                        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
                            <div style={{
                                padding: "14px 18px", borderBottom: `1px solid ${BORDER}`,
                                display: "flex", alignItems: "center", gap: 10
                            }}>
                                <span style={{ color: "#60a5fa" }}>{I.Server}</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>System Info</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {[
                                    ["Backend API", `${API}`, "#60a5fa"],
                                    ["Server Uptime", fmtUptime(uptime), "#34d399"],
                                    ["Registered Users", `${users.length}`, "#a78bfa"],
                                    ["Simulated Machines", `${machines.length}`, "#f59e0b"],
                                    ["Active Sensors", `${totalSensors}`, "#38bdf8"],
                                    ["Critical Alerts", `${critCount}`, critCount > 0 ? "#e8192c" : "#34d399"],
                                ].map(([k, v, col], i, arr) => (
                                    <div key={k} style={{
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        padding: "12px 18px",
                                        borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : "none",
                                    }}>
                                        <span style={{ fontSize: 12, color: MUTED }}>{k}</span>
                                        <span style={{ fontSize: 12.5, fontWeight: 700, color: col, fontFamily: MONO }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </main>

            {/* Delete confirmation modal */}
            {deleteTarget && (
                <ConfirmModal
                    title="Delete User Account"
                    body={`This will permanently remove ${deleteTarget.name} (${deleteTarget.email}) from the system. This action cannot be undone.`}
                    onConfirm={() => deleteUser(deleteTarget.id)}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            <style>{`
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        *{box-sizing:border-box;}
        input::placeholder,textarea::placeholder{color:rgba(220,225,255,0.2);}
        input:focus,textarea:focus{border-color:rgba(255,255,255,0.18)!important;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px;}
      `}</style>
        </div>
    );
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function AdminPage() {
    const [unlocked, setUnlocked] = useState(
        () => sessionStorage.getItem("admin_unlocked") === "1"
    );

    function unlock() {
        sessionStorage.setItem("admin_unlocked", "1");
        setUnlocked(true);
    }

    if (!unlocked) return <PasswordGate onUnlock={unlock} />;
    return <AdminDashboard />;
}
