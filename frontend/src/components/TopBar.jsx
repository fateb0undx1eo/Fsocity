import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const SunIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);
const MoonIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

export default function TopBar() {
    const { isDark, colors: c, toggleTheme } = useTheme();
    const navigate = useNavigate();

    return (
        <header style={{
            position: "fixed", top: 0, left: 0, right: 0, height: "58px", zIndex: 200,
            background: "transparent",
            display: "flex", alignItems: "center", padding: "0 20px 0 16px",
            gap: "14px",
        }}>
            {/* Logo + brand */}
            <div
                onClick={() => navigate("/")}
                style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", flexShrink: 0 }}
            >
                <img
                    src="/logo.png" alt="Logo"
                    style={{ height: "32px", width: "auto", objectFit: "contain", filter: isDark ? "none" : "brightness(0) invert(1)" }}
                    onError={e => { e.target.style.display = "none"; }}
                />
                <span style={{
                    fontSize: "16px", fontWeight: 800,
                    color: isDark ? "#f0f2fc" : "#141829",
                    fontFamily: c.fontHeading, letterSpacing: "-0.03em",
                }}>
                    Industrial Monitor
                </span>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Theme toggle */}
            <button
                onClick={toggleTheme}
                title={isDark ? "Switch to Light" : "Switch to Dark"}
                style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    background: isDark ? "rgba(255,255,255,0.07)" : "rgba(20,24,44,0.07)",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(20,24,44,0.12)"}`,
                    borderRadius: "999px",
                    color: isDark ? "rgba(240,242,252,0.65)" : "rgba(20,24,44,0.5)",
                    padding: "5px 14px", fontSize: "12px", fontWeight: 600,
                    fontFamily: c.fontBody, cursor: "pointer",
                    transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = isDark ? "#f0f2fc" : "#141829"; e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.12)" : "rgba(20,24,44,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = isDark ? "rgba(240,242,252,0.65)" : "rgba(20,24,44,0.5)"; e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.07)" : "rgba(20,24,44,0.07)"; }}
            >
                {isDark ? <SunIcon /> : <MoonIcon />}
                {isDark ? "Light" : "Dark"}
            </button>
        </header>
    );
}
