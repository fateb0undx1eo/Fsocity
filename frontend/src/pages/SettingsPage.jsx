import { useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function load(key, fallback) {
    try { return localStorage.getItem(key) ?? fallback; }
    catch { return fallback; }
}
function save(key, val) { try { localStorage.setItem(key, val); } catch { } }

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const MailIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);
const BellIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);
const UserIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const ACCENT = "#e8192c";

export default function SettingsPage() {
    const { user, updateAvatar } = useAuth();
    const { colors: c, isDark } = useTheme();
    const fileInputRef = useRef(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar ?? null);
    const [avatarHov, setAvatarHov] = useState(false);
    const [pfpToast, setPfpToast] = useState(null);

    const [alertEmail, setAlertEmail] = useState(() => load("iot_alert_email", ""));
    const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(() => load("iot_email_alerts", "true") !== "false");
    const [saved, setSaved] = useState(false);
    const notifPerm = typeof Notification !== "undefined" ? Notification.permission : "unsupported";

    function saveSettings() {
        save("iot_alert_email", alertEmail.trim());
        save("iot_email_alerts", emailAlertsEnabled ? "true" : "false");
        setSaved(true);
        setTimeout(() => setSaved(false), 2200);
    }

    async function requestNotifPermission() {
        if (typeof Notification === "undefined") return;
        await Notification.requestPermission();
        window.location.reload();
    }

    const cardBase = {
        background: isDark ? "#0d0d10" : "#f7f8fc",
        border: `1px solid ${isDark ? "#1e1e22" : "#dde3f0"}`,
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "14px",
        boxShadow: isDark ? "none" : "0 2px 12px rgba(20,24,44,0.05)",
    };

    const sectionTitle = (text, icon, color) => (
        <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "18px" }}>
            <span style={{
                width: "30px", height: "30px", borderRadius: "8px",
                background: `${color}18`, color,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
            }}>{icon}</span>
            <span style={{ fontSize: "14px", fontWeight: 700, color: c.textPrimary, fontFamily: c.fontHeading }}>{text}</span>
        </div>
    );

    const inputStyle = {
        width: "100%", background: isDark ? "#161618" : "#eef1f8",
        border: `1px solid ${isDark ? "#2a2a2a" : "#c8d2e8"}`,
        borderRadius: "9px", color: c.textPrimary, padding: "10px 14px",
        fontSize: "13px", fontFamily: c.fontBody, outline: "none", boxSizing: "border-box",
        transition: "border-color 0.15s",
    };

    const notifColors = {
        granted: { bg: "#d1fae5", color: "#065f46", label: "✓ Allowed" },
        denied: { bg: "#fee2e2", color: "#7f1d1d", label: "✗ Blocked" },
        default: { bg: "#fef3c7", color: "#78350f", label: "⚠ Not yet requested" },
        unsupported: { bg: "#f3f4f6", color: "#374151", label: "Not supported" },
    };
    const nc = notifColors[notifPerm] || notifColors.default;

    return (
        <div style={{ background: "transparent", minHeight: "100vh" }}>
            <Sidebar />
            <main style={{ padding: "32px 36px", maxWidth: "660px" }}>

                <h2 style={{ fontSize: "24px", fontWeight: 800, color: c.textPrimary, fontFamily: c.fontHeading, letterSpacing: "-0.03em", margin: "0 0 28px" }}>
                    Settings
                </h2>

                {/* ── Profile Card ──────────────────────────── */}
                <div style={{ ...cardBase }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                        {/* Clickable avatar upload zone */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onMouseEnter={() => setAvatarHov(true)}
                            onMouseLeave={() => setAvatarHov(false)}
                            style={{
                                width: "72px", height: "72px", borderRadius: "50%",
                                flexShrink: 0, cursor: "pointer", position: "relative",
                                boxShadow: avatarHov
                                    ? "0 0 0 3px #6366f1, 0 4px 20px rgba(99,102,241,0.35)"
                                    : `0 4px 16px rgba(232,25,44,0.25)`,
                                transition: "box-shadow 0.2s",
                                overflow: "hidden",
                            }}
                        >
                            {/* Photo or initials */}
                            {avatarPreview
                                ? <img src={avatarPreview} alt="avatar"
                                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                : <div style={{
                                    width: "100%", height: "100%",
                                    background: `linear-gradient(135deg,${ACCENT},#8b0000)`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "22px", fontWeight: 800, color: "#fff",
                                    fontFamily: c.fontHeading,
                                }}>{user?.initials ?? "?"}</div>
                            }
                            {/* Hover overlay */}
                            <div style={{
                                position: "absolute", inset: 0,
                                background: "rgba(0,0,0,0.45)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                opacity: avatarHov ? 1 : 0,
                                transition: "opacity 0.18s",
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                            </div>
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={e => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 5 * 1024 * 1024) {
                                    setPfpToast({ msg: "Image must be under 5 MB.", ok: false });
                                    setTimeout(() => setPfpToast(null), 3000);
                                    return;
                                }
                                const reader = new FileReader();
                                reader.onload = ev => {
                                    const dataUrl = ev.target.result;
                                    setAvatarPreview(dataUrl);
                                    updateAvatar(dataUrl);
                                    setPfpToast({ msg: "Profile photo updated!", ok: true });
                                    setTimeout(() => setPfpToast(null), 2500);
                                };
                                reader.readAsDataURL(file);
                                // reset so same file can be re-chosen
                                e.target.value = "";
                            }}
                        />

                        {/* Info + actions */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "17px", fontWeight: 800, color: c.textPrimary, fontFamily: c.fontHeading, marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {user?.name || "—"}
                            </div>
                            <div style={{ fontSize: "13px", color: c.textMuted, fontFamily: c.fontBody, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {user?.email || "—"}
                            </div>
                            <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        background: "#4f46e5", border: "none", color: "#fff",
                                        borderRadius: "8px", padding: "5px 14px",
                                        fontSize: "12px", fontWeight: 700, fontFamily: c.fontBody,
                                        cursor: "pointer", boxShadow: "0 2px 10px rgba(79,70,229,0.35)",
                                        transition: "opacity 0.15s",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                                ><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: 5, verticalAlign: "middle" }}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>Change photo</button>
                                {avatarPreview && (
                                    <button
                                        onClick={() => {
                                            setAvatarPreview(null);
                                            updateAvatar(null);
                                            setPfpToast({ msg: "Photo removed.", ok: true });
                                            setTimeout(() => setPfpToast(null), 2000);
                                        }}
                                        style={{
                                            background: "transparent",
                                            border: `1px solid ${isDark ? "rgba(239,68,68,0.3)" : "rgba(239,68,68,0.25)"}`,
                                            color: "#f87171", borderRadius: "8px",
                                            padding: "5px 14px", fontSize: "12px",
                                            fontWeight: 600, fontFamily: c.fontBody, cursor: "pointer",
                                        }}
                                    >Remove</button>
                                )}
                            </div>
                        </div>

                        {/* Active badge */}
                        <span style={{
                            background: "#d1fae5", color: "#065f46", fontSize: "10px", fontWeight: 700,
                            padding: "4px 10px", borderRadius: "999px", fontFamily: c.fontBody,
                            letterSpacing: "0.04em", flexShrink: 0, alignSelf: "flex-start",
                        }}>● Active</span>
                    </div>

                    {/* Helper text */}
                    <div style={{ marginTop: "12px", fontSize: "11px", color: c.textMuted, fontFamily: c.fontBody, opacity: 0.7 }}>
                        JPG, PNG or GIF · Max 5 MB · Click the photo to change it
                    </div>
                </div>

                {/* Toast notification */}
                {pfpToast && (
                    <div style={{
                        position: "fixed", bottom: "28px", right: "28px", zIndex: 400,
                        background: pfpToast.ok ? "#d1fae5" : "#fee2e2",
                        color: pfpToast.ok ? "#065f46" : "#7f1d1d",
                        borderRadius: "12px", padding: "12px 18px",
                        fontSize: "13px", fontWeight: 700, fontFamily: c.fontBody,
                        boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
                        animation: "mcSlideIn 0.3s ease",
                    }}>{pfpToast.msg}</div>
                )}
                <style>{`@keyframes mcSlideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

                {/* ── Alert Email ───────────────────────────── */}
                <div style={cardBase}>
                    {sectionTitle("Alert Email", <MailIcon />, "#6366f1")}
                    <div style={{ marginBottom: "14px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: c.textMuted, fontFamily: c.fontBody, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>
                            Email address for alerts
                        </div>
                        <input
                            type="email"
                            value={alertEmail}
                            onChange={e => setAlertEmail(e.target.value)}
                            placeholder={user?.email || "you@example.com"}
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = "#6366f1"}
                            onBlur={e => e.target.style.borderColor = isDark ? "#2a2a2a" : "#c8d2e8"}
                        />
                        <div style={{ fontSize: "11px", color: c.textMuted, fontFamily: c.fontBody, marginTop: "7px", opacity: 0.7, lineHeight: 1.5 }}>
                            Leave blank to use your account email. Rate-limited to 1 email per sensor per 10 minutes.
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Toggle value={emailAlertsEnabled} onChange={setEmailAlertsEnabled} />
                        <span style={{ fontSize: "13px", color: c.textPrimary, fontFamily: c.fontBody }}>
                            Email me when a sensor limit is exceeded
                        </span>
                    </div>
                </div>

                {/* ── Browser Notifications ─────────────────── */}
                <div style={cardBase}>
                    {sectionTitle("Push Notifications", <BellIcon />, "#f59e0b")}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <span style={{
                            background: nc.bg, color: nc.color, fontSize: "11px", fontWeight: 700,
                            padding: "5px 13px", borderRadius: "999px", fontFamily: c.fontBody, letterSpacing: "0.05em",
                        }}>
                            {nc.label}
                        </span>
                        {(notifPerm === "default" || notifPerm === "denied") && (
                            <button
                                onClick={requestNotifPermission}
                                disabled={notifPerm === "denied"}
                                style={{
                                    background: notifPerm === "denied" ? "rgba(100,100,100,0.15)" : "#4f46e5",
                                    border: "none", color: notifPerm === "denied" ? c.textMuted : "#fff",
                                    borderRadius: "8px", padding: "7px 16px", fontSize: "12px",
                                    fontWeight: 700, fontFamily: c.fontBody,
                                    cursor: notifPerm === "denied" ? "not-allowed" : "pointer",
                                }}
                            >
                                {notifPerm === "denied" ? "Blocked by browser" : "Enable Notifications"}
                            </button>
                        )}
                    </div>
                    {notifPerm === "denied" && (
                        <div style={{ fontSize: "11px", color: c.textMuted, fontFamily: c.fontBody, marginTop: "10px", lineHeight: 1.6 }}>
                            To re-enable: click the 🔒 icon in your browser address bar → Notifications → Allow, then refresh.
                        </div>
                    )}
                </div>

                {/* ── Account (read-only) ───────────────────── */}
                <div style={cardBase}>
                    {sectionTitle("Account", <UserIcon />, "#22c55e")}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <ReadRow label="Full Name" value={user?.name || "—"} c={c} />
                        <ReadRow label="Email" value={user?.email || "—"} c={c} />
                        <ReadRow label="User ID" value={user?.id || "—"} c={c} mono />
                    </div>
                </div>

                {/* ── Save ─────────────────────────────────── */}
                <button
                    onClick={saveSettings}
                    style={{
                        background: saved ? "#22c55e" : "#4f46e5",
                        border: "none", color: "#fff", borderRadius: "12px",
                        padding: "13px 36px", fontSize: "14px", fontWeight: 700,
                        fontFamily: c.fontBody, cursor: "pointer",
                        boxShadow: `0 4px 18px ${saved ? "rgba(34,197,94,0.4)" : "rgba(79,70,229,0.4)"}`,
                        transition: "background 0.25s, box-shadow 0.25s",
                        marginTop: "4px",
                    }}
                >
                    {saved ? "✓ Saved!" : "Save Settings"}
                </button>
            </main>
        </div>
    );
}

function Toggle({ value, onChange }) {
    return (
        <button
            onClick={() => onChange(!value)}
            style={{
                width: "40px", height: "22px", borderRadius: "999px", border: "none",
                background: value ? "#4f46e5" : "rgba(100,100,120,0.3)",
                position: "relative", cursor: "pointer",
                transition: "background 0.2s", flexShrink: 0,
                boxShadow: value ? "0 0 0 2px rgba(99,102,241,0.25)" : "none",
            }}
        >
            <span style={{
                position: "absolute", top: "3px", left: value ? "20px" : "3px",
                width: "16px", height: "16px", borderRadius: "50%",
                background: "#fff", transition: "left 0.2s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
            }} />
        </button>
    );
}

function ReadRow({ label, value, c, mono }) {
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "8px 12px",
            background: "rgba(128,128,128,0.05)",
            borderRadius: "8px",
        }}>
            <span style={{ fontSize: "11px", color: c.textMuted, fontFamily: c.fontBody, fontWeight: 700, minWidth: "68px", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</span>
            <span style={{ fontSize: "13px", color: c.textPrimary, fontFamily: mono ? c.fontMono : c.fontBody }}>{value}</span>
        </div>
    );
}
