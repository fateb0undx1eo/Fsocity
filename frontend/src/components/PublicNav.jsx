import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ACCENT = "#e8192c";

const NAV_LINKS = [
    { label: "Features", path: "/features" },
    { label: "Pricing", path: "/pricing" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
];

function NavLink({ label, path, active }) {
    const navigate = useNavigate();
    const [hov, setHov] = useState(false);
    const lit = active || hov;
    return (
        <button
            onClick={() => navigate(path)}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                background: "transparent",
                border: "none",
                borderRadius: "10px",
                padding: "7px 16px",
                cursor: "pointer",
                fontFamily: '"Plus Jakarta Sans",sans-serif',
                fontSize: "13.5px",
                fontWeight: lit ? 700 : 500,
                color: active ? ACCENT : hov ? "rgba(240,242,252,0.9)" : "rgba(220,225,255,0.5)",
                transition: "color 0.15s",
                letterSpacing: active ? "0" : "-0.01em",
            }}
        >
            {label}
        </button>
    );
}

export default function PublicNav({ alwaysFilled = false }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(alwaysFilled);

    useEffect(() => {
        if (alwaysFilled) return;
        const h = () => setScrolled(window.scrollY > 40);
        h();
        window.addEventListener("scroll", h);
        return () => window.removeEventListener("scroll", h);
    }, [alwaysFilled]);

    const filled = alwaysFilled || scrolled;

    return (
        <nav style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
            height: "64px",
            display: "flex", alignItems: "center", padding: "0 40px",
            background: filled ? "rgba(6,6,8,0.88)" : "transparent",
            backdropFilter: filled ? "blur(20px)" : "none",
            borderBottom: filled ? "1px solid rgba(255,255,255,0.07)" : "none",
            transition: "background 0.3s, backdrop-filter 0.3s, border-color 0.3s",
        }}>
            {/* Logo */}
            <div
                onClick={() => navigate("/")}
                style={{ display: "flex", alignItems: "center", cursor: "pointer", flexShrink: 0 }}
            >
                <img
                    src="/logo.png" alt="fsociety"
                    style={{ height: "52px", width: "52px", objectFit: "contain" }}
                    onError={e => e.target.style.display = "none"}
                />
            </div>

            {/* Nav links — centred */}
            <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: "2px" }}>
                {NAV_LINKS.map(({ label, path }) => (
                    <NavLink
                        key={label}
                        label={label}
                        path={path}
                        active={location.pathname === path}
                    />
                ))}
            </div>

            {/* Auth buttons */}
            <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                <button
                    onClick={() => navigate("/login")}
                    style={{
                        background: "transparent",
                        border: "1px solid rgba(255,255,255,0.14)",
                        borderRadius: "999px",
                        color: "rgba(220,225,255,0.65)",
                        padding: "7px 18px",
                        fontSize: "13px", fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: '"Plus Jakarta Sans",sans-serif',
                        transition: "color 0.15s, border-color 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.38)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(220,225,255,0.65)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; }}
                >
                    Log In
                </button>
                <button
                    onClick={() => navigate("/login?mode=signup")}
                    style={{
                        background: ACCENT,
                        border: "none",
                        borderRadius: "999px",
                        color: "#fff",
                        padding: "7px 20px",
                        fontSize: "13px", fontWeight: 800,
                        cursor: "pointer",
                        fontFamily: '"Plus Jakarta Sans",sans-serif',
                        boxShadow: "0 4px 16px rgba(232,25,44,0.32)",
                        transition: "opacity 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.86"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                    Get Started
                </button>
            </div>
        </nav>
    );
}
