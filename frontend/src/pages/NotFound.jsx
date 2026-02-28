import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();
    const [glitch, setGlitch] = useState(false);

    useEffect(() => {
        const fire = () => { setGlitch(true); setTimeout(() => setGlitch(false), 160); };
        fire();
        const id = setInterval(fire, 3500 + Math.random() * 2000);
        return () => clearInterval(id);
    }, []);

    return (
        <div style={{
            minHeight: "100vh", background: "#070709",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            overflow: "hidden", position: "relative", gap: 0,
        }}>

            {/* CRT scanlines */}
            <div style={{
                position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
                backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.12) 2px,rgba(0,0,0,0.12) 4px)"
            }} />

            {/* ── bg image — contained, natural aspect ratio ── */}
            <div style={{
                position: "relative", zIndex: 1,
                width: "min(88vw, 820px)",
                marginBottom: "32px",
            }}>
                <img
                    src="/404bg.jpg"
                    alt=""
                    style={{
                        width: "100%", height: "auto", display: "block",
                        borderRadius: "12px",
                        filter: glitch
                            ? "hue-rotate(80deg) saturate(2.2) brightness(1.2)"
                            : "brightness(0.92) saturate(1.1)",
                        transform: glitch ? `translateX(${Math.random() > 0.5 ? 5 : -5}px)` : "translateX(0)",
                        transition: glitch ? "none" : "filter 0.35s, transform 0.35s",
                        boxShadow: "0 0 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)",
                    }}
                    onError={e => { e.target.style.display = "none"; }}
                />
                {/* Chromatic ghost on glitch */}
                {glitch && (
                    <img src="/404bg.jpg" alt="" aria-hidden style={{
                        position: "absolute", inset: 0, width: "100%", height: "100%",
                        objectFit: "cover", borderRadius: "12px",
                        transform: "translate(7px,-3px)",
                        mixBlendMode: "screen",
                        filter: "saturate(4) hue-rotate(200deg)",
                        opacity: 0.4,
                    }} />
                )}
            </div>

            {/* ── Text block ── */}
            <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>

                {/* 404 — clean bold, same font as app */}
                <p style={{
                    margin: "0 0 8px",
                    fontSize: "clamp(64px,12vw,130px)",
                    fontWeight: 900,
                    letterSpacing: "-0.05em",
                    lineHeight: 1,
                    color: "#ffffff",
                    textShadow: glitch
                        ? "5px 0 #ff0040, -5px 0 #00ffcc"
                        : "0 2px 40px rgba(255,255,255,0.15)",
                    transition: glitch ? "none" : "text-shadow 0.4s",
                }}>
                    404
                </p>

                {/* Subtitle */}
                <p style={{
                    margin: "0 0 28px",
                    fontSize: "14px", fontWeight: 500,
                    color: "rgba(220,225,255,0.45)",
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    textShadow: glitch ? "3px 0 #ff0040, -3px 0 #00ffcc" : "none",
                }}>
                    Page not found
                </p>

                {/* Minimal back link */}
                <span
                    onClick={() => navigate("/")}
                    style={{
                        fontSize: "13px", fontWeight: 600,
                        color: "#e8192c", cursor: "pointer",
                        letterSpacing: "0.04em",
                        borderBottom: "1px solid rgba(232,25,44,0.35)",
                        paddingBottom: "2px",
                        transition: "border-color 0.2s, color 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#e8192c"; e.currentTarget.style.color = "#ff4a5a"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(232,25,44,0.35)"; e.currentTarget.style.color = "#e8192c"; }}
                >
                    ← Go home
                </span>
            </div>
        </div>
    );
}
