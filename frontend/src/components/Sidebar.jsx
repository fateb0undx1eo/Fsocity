import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useAlerts } from "../context/AlertsContext";

const ACCENT = "#e8192c";

const NAV = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Machines", path: "/machines" },
  { label: "Alerts", path: "/alerts" },
  { label: "Reports", path: "/reports" },
  { label: "Settings", path: "/settings" },
];

/* ── SVG Icons ─────────────────────────────────────────────────── */
const HamburgerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const SwitchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);
const SignOutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function Sidebar() {
  const { colors: c, isDark } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hovLink, setHovLink] = useState(null);
  const [showAcc, setShowAcc] = useState(false);
  const [drawerOpen, setDrawer] = useState(false);
  const alertsCtx = useAlerts();
  const unreadCount = alertsCtx?.unreadCount ?? 0;
  const accRef = useRef(null);

  // Close account dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (accRef.current && !accRef.current.contains(e.target)) setShowAcc(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close drawer on route change
  useEffect(() => { setDrawer(false); }, [location.pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const navBg = isDark ? "rgba(6,6,8,0.82)" : "rgba(255,255,255,0.82)";
  const navBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(20,24,44,0.08)";
  const drawerBg = isDark ? "#0a0a0e" : "#ffffff";

  /* Avatar element (shared between navbar and drawer) */
  const AvatarEl = ({ size = 34 }) => user?.avatar
    ? <img src={user.avatar} alt="avatar" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${ACCENT}55` }} />
    : <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg,${ACCENT},#8b0000)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 800, color: "#fff", fontFamily: '"Plus Jakarta Sans",sans-serif', flexShrink: 0 }}>{user?.initials ?? "?"}</div>;

  return (
    <>
      {/* ════════════════════════ TOP NAV BAR ════════════════════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, height: "70px", zIndex: 300,
        display: "flex", alignItems: "center", padding: "0 20px", gap: 0,
        background: navBg,
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        borderBottom: `1px solid ${navBorder}`,
      }}>

        {/* Logo */}
        <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", cursor: "pointer", flexShrink: 0 }}>
          <img src="/logo.png" alt="fsociety" style={{ height: "62px", width: "62px", objectFit: "contain" }}
            onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
          />
          <div style={{ width: "62px", height: "62px", borderRadius: "9px", background: ACCENT, display: "none", alignItems: "center", justifyContent: "center" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
        </div>

        {/* ── DESKTOP: centred nav links (hidden below 768px) ── */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "2px" }}
          className="desktop-nav">
          {NAV.map(({ label, path }) => {
            const active = location.pathname === path;
            const isHov = hovLink === label;
            return (
              <button key={label}
                onClick={() => navigate(path)}
                onMouseEnter={() => setHovLink(label)}
                onMouseLeave={() => setHovLink(null)}
                style={{
                  background: active ? "rgba(232,25,44,0.12)" : "transparent",
                  border: "none", borderRadius: "10px", padding: "7px 16px",
                  cursor: "pointer", fontFamily: '"Plus Jakarta Sans",sans-serif',
                  fontSize: "13.5px", fontWeight: active || isHov ? 700 : 500,
                  color: active || isHov ? ACCENT : (isDark ? "rgba(220,225,255,0.55)" : "rgba(20,24,44,0.5)"),
                  transition: "color 0.15s, background 0.15s",
                  position: "relative", display: "flex", alignItems: "center", gap: "6px",
                }}>
                {label}
                {label === "Alerts" && unreadCount > 0 && (
                  <span style={{ background: "#ef4444", color: "#fff", fontSize: "9px", fontWeight: 800, padding: "1px 5px", borderRadius: "999px", lineHeight: "14px", minWidth: "14px", textAlign: "center" }}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
                {active && <span style={{ position: "absolute", bottom: "4px", left: "50%", transform: "translateX(-50%)", width: "4px", height: "4px", borderRadius: "50%", background: ACCENT, display: "block" }} />}
              </button>
            );
          })}
        </div>

        {/* ── DESKTOP: account dropdown (hidden below 768px) ── */}
        <div style={{ position: "relative", flexShrink: 0 }} ref={accRef} className="desktop-nav">
          <button onClick={() => setShowAcc(v => !v)}
            style={{ display: "flex", alignItems: "center", gap: "9px", background: "transparent", border: "none", cursor: "pointer", padding: "5px 0" }}>
            <AvatarEl />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: isDark ? "#f0f2fc" : "#141829", fontFamily: '"Plus Jakarta Sans",sans-serif', lineHeight: 1.2 }}>{user?.name ?? "Guest"}</div>
              <div style={{ fontSize: "10px", color: isDark ? "rgba(220,225,255,0.4)" : "rgba(20,24,44,0.4)", fontFamily: '"Plus Jakarta Sans",sans-serif' }}>{user?.email ?? ""}</div>
            </div>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isDark ? "rgba(220,225,255,0.4)" : "rgba(20,24,44,0.4)"} strokeWidth="2.5" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showAcc && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 400, background: isDark ? "#111116" : "#f7f8fc", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#dde3f0"}`, borderRadius: "14px", padding: "6px", boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.5)" : "0 8px 32px rgba(20,24,44,0.12)", minWidth: "200px" }}>
              <div style={{ padding: "10px 12px 12px", marginBottom: "2px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e8edf5"}` }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: isDark ? "#f0f2fc" : "#141829", fontFamily: '"Plus Jakarta Sans",sans-serif' }}>{user?.name ?? "Guest"}</div>
                <div style={{ fontSize: "11px", color: isDark ? "rgba(220,225,255,0.4)" : "rgba(20,24,44,0.4)", fontFamily: '"Plus Jakarta Sans",sans-serif', marginTop: "2px" }}>{user?.email ?? ""}</div>
              </div>
              <div style={{ paddingTop: "4px" }}>
                <DropItem icon={<SettingsIcon />} label="Settings" onClick={() => { navigate("/settings"); setShowAcc(false); }} isDark={isDark} />
                <DropItem icon={<SwitchIcon />} label="Switch Account" onClick={() => { logout(); navigate("/login"); setShowAcc(false); }} isDark={isDark} />
                <div style={{ height: "1px", background: isDark ? "rgba(255,255,255,0.06)" : "#e8edf5", margin: "4px 0" }} />
                <DropItem icon={<SignOutIcon />} label="Sign Out" onClick={() => { logout(); navigate("/"); setShowAcc(false); }} isDark={isDark} danger />
              </div>
            </div>
          )}
        </div>

        {/* ── MOBILE: right side — alert badge + hamburger (visible below 768px) ── */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }} className="mobile-nav">
          {/* Alert badge */}
          {unreadCount > 0 && (
            <button onClick={() => navigate("/alerts")} style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", borderRadius: "999px", padding: "3px 10px", fontSize: "11px", fontWeight: 700, fontFamily: '"Plus Jakarta Sans",sans-serif', cursor: "pointer" }}>
              {unreadCount} alert{unreadCount > 1 ? "s" : ""}
            </button>
          )}
          {/* Hamburger button */}
          <button onClick={() => setDrawer(v => !v)} style={{ background: "transparent", border: `1px solid ${navBorder}`, borderRadius: "9px", padding: "7px", cursor: "pointer", color: isDark ? "rgba(220,225,255,0.7)" : "rgba(20,24,44,0.6)", display: "flex", alignItems: "center", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            {drawerOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>
      </nav>

      {/* ════════════════════════ MOBILE DRAWER ════════════════════════ */}
      {/* Backdrop */}
      <div onClick={() => setDrawer(false)} style={{
        position: "fixed", inset: 0, zIndex: 290,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        opacity: drawerOpen ? 1 : 0,
        pointerEvents: drawerOpen ? "auto" : "none",
        transition: "opacity 0.25s",
      }} className="mobile-nav" />

      {/* Slide-in panel */}
      <div style={{
        position: "fixed", top: "70px", left: 0, bottom: 0, zIndex: 295,
        width: "280px", maxWidth: "85vw",
        background: drawerBg,
        borderRight: `1px solid ${navBorder}`,
        boxShadow: drawerOpen ? "4px 0 32px rgba(0,0,0,0.3)" : "none",
        transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
        overflowY: "auto",
      }} className="mobile-nav">

        {/* Nav links */}
        <div style={{ padding: "12px 10px", flex: 1 }}>
          {NAV.map(({ label, path }) => {
            const active = location.pathname === path;
            return (
              <button key={label} onClick={() => { navigate(path); setDrawer(false); }} style={{
                display: "flex", alignItems: "center", gap: "12px",
                width: "100%", padding: "12px 14px", borderRadius: "12px",
                background: active ? "rgba(232,25,44,0.1)" : "transparent",
                border: "none", cursor: "pointer", textAlign: "left",
                fontFamily: '"Plus Jakarta Sans",sans-serif',
                fontSize: "15px", fontWeight: active ? 700 : 500,
                color: active ? ACCENT : (isDark ? "rgba(220,225,255,0.75)" : "rgba(20,24,44,0.7)"),
                marginBottom: "2px", transition: "background 0.15s, color 0.15s",
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                {/* Active indicator bar */}
                <span style={{ width: "3px", height: "18px", borderRadius: "2px", background: active ? ACCENT : "transparent", flexShrink: 0, transition: "background 0.15s" }} />
                {label}
                {label === "Alerts" && unreadCount > 0 && (
                  <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", fontSize: "10px", fontWeight: 800, padding: "2px 7px", borderRadius: "999px" }}>{unreadCount}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* User profile section at bottom */}
        <div style={{ padding: "14px", borderTop: `1px solid ${navBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <AvatarEl size={42} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: isDark ? "#f0f2fc" : "#141829", fontFamily: '"Plus Jakarta Sans",sans-serif', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name ?? "Guest"}</div>
              <div style={{ fontSize: "11px", color: isDark ? "rgba(220,225,255,0.4)" : "rgba(20,24,44,0.4)", fontFamily: '"Plus Jakarta Sans",sans-serif', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email ?? ""}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <DropItem icon={<SettingsIcon />} label="Settings" onClick={() => { navigate("/settings"); setDrawer(false); }} isDark={isDark} />
            <DropItem icon={<SwitchIcon />} label="Switch Account" onClick={() => { logout(); navigate("/login"); setDrawer(false); }} isDark={isDark} />
            <div style={{ height: "1px", background: isDark ? "rgba(255,255,255,0.06)" : "#e8edf5", margin: "4px 0" }} />
            <DropItem icon={<SignOutIcon />} label="Sign Out" onClick={() => { logout(); navigate("/"); setDrawer(false); }} isDark={isDark} danger />
          </div>
        </div>
      </div>

      {/* Height spacer */}
      <div style={{ height: "70px", flexShrink: 0 }} />

      {/* Responsive CSS */}
      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-nav  { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav  { display: flex !important; }
        }
      `}</style>
    </>
  );
}

function DropItem({ icon, label, onClick, isDark, danger }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: "10px", width: "100%",
        background: hov ? (danger ? "rgba(239,68,68,0.08)" : (isDark ? "rgba(255,255,255,0.05)" : "#eef1f8")) : "transparent",
        border: "none", borderRadius: "9px", padding: "9px 12px", cursor: "pointer",
        fontFamily: '"Plus Jakarta Sans",sans-serif', fontSize: "13px",
        color: danger ? "#f87171" : (isDark ? "rgba(220,225,255,0.85)" : "#141829"),
        fontWeight: 500, textAlign: "left", transition: "background 0.12s, color 0.12s",
      }}>
      <span style={{ opacity: danger ? 1 : 0.7, display: "flex", alignItems: "center" }}>{icon}</span>
      {label}
    </button>
  );
}
