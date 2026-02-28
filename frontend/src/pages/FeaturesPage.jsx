import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import StarField from "../components/StarField";
import PublicNav from "../components/PublicNav";

const ACCENT = "#e8192c";

const FEATURES = [
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        ),
        title: "Real-Time Sensor Monitoring",
        desc: "Stream live telemetry from thousands of sensors — temperature, pressure, RPM, vibration — tracked the instant it changes.",
        tag: "Core",
        color: "#60a5fa",
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M14.5 7.5H10a2.5 2.5 0 0 0 0 5h4a2.5 2.5 0 0 1 0 5H9" />
                <line x1="12" y1="6" x2="12" y2="7.5" /><line x1="12" y1="17.5" x2="12" y2="19" />
            </svg>
        ),
        title: "Financial Automation",
        desc: "Link sensor data directly to your P&L. Surface the financial cost of anomalies before they become failures.",
        tag: "Finance",
        color: "#34d399",
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
            </svg>
        ),
        title: "Custom Machine Profiles",
        desc: "Every deployment is tailored to your hardware. Bring your own sensors or use our certified kits — we handle setup end-to-end.",
        tag: "Setup",
        color: "#f59e0b",
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
        ),
        title: "Intelligent Alerting",
        desc: "Multi-tier threshold alerts — Normal, Warning, Critical — routed to the right people via email, SMS, or webhook.",
        tag: "Alerts",
        color: "#e8192c",
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
        ),
        title: "Historical Reports",
        desc: "1h, 7d, 30d trend charts with exportable PDFs. Identify patterns, schedule maintenance, and prove ROI.",
        tag: "Analytics",
        color: "#a78bfa",
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        title: "Enterprise Security",
        desc: "Role-based access, encrypted sessions, and full audit logs. Your operational data stays 100% yours.",
        tag: "Security",
        color: "#38bdf8",
    },
];

function useReveal() {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return { ref, visible };
}

function Reveal({ children, delay = 0 }) {
    const { ref, visible } = useReveal();
    return (
        <div ref={ref} style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(28px)",
            transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
        }}>
            {children}
        </div>
    );
}

function FeatureCard({ icon, title, desc, tag, color }) {
    const [hov, setHov] = useState(false);
    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                padding: "28px 24px",
                borderRadius: "16px",
                border: `1px solid ${hov ? `${color}38` : "rgba(255,255,255,0.07)"}`,
                background: hov ? `${color}07` : "rgba(255,255,255,0.02)",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                transform: hov ? "translateY(-6px)" : "translateY(0)",
                transition: "transform 0.32s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s, background 0.2s, box-shadow 0.3s",
                boxShadow: hov ? `0 20px 48px rgba(0,0,0,0.38), 0 0 0 1px ${color}12` : "none",
                cursor: "default",
            }}
        >
            {/* Icon row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `${color}14`,
                    border: `1px solid ${color}26`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: color,
                    transition: "background 0.2s",
                }}>
                    {icon}
                </div>
                <span style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: color,
                    background: `${color}14`,
                    border: `1px solid ${color}26`,
                    borderRadius: "999px",
                    padding: "3px 10px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                }}>{tag}</span>
            </div>

            {/* Text */}
            <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#f0f2fc", margin: "0 0 8px", letterSpacing: "-0.025em" }}>{title}</h3>
                <p style={{ fontSize: "13.5px", color: "rgba(220,225,255,0.48)", lineHeight: 1.7, margin: 0 }}>{desc}</p>
            </div>
        </div>
    );
}

export default function FeaturesPage() {
    const navigate = useNavigate();

    return (
        <div style={{
            background: "#060608",
            color: "#f0f2fc",
            fontFamily: '"Plus Jakarta Sans",sans-serif',
            minHeight: "100vh",
            overflowX: "hidden",
        }}>
            <StarField />
            <PublicNav />

            {/* Hero */}
            <section style={{ padding: "120px 40px 72px", textAlign: "center" }}>
                <Reveal>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: ACCENT, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 18px" }}>
                        Platform Features
                    </p>
                    <h1 style={{
                        fontSize: "clamp(36px,5vw,66px)",
                        fontWeight: 900,
                        letterSpacing: "-0.04em",
                        lineHeight: 1.08,
                        margin: "0 0 20px",
                        background: "linear-gradient(135deg,#ffffff 40%,rgba(255,255,255,0.5))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}>
                        Everything your machines know,<br />
                        <span style={{ background: `linear-gradient(90deg,${ACCENT},#ff4a5a)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            your finance team will too.
                        </span>
                    </h1>
                    <p style={{ fontSize: "16px", color: "rgba(220,225,255,0.45)", lineHeight: 1.75, maxWidth: "520px", margin: "0 auto 36px" }}>
                        A unified platform that brings real-time IoT intelligence and financial precision together — built for teams that can't afford surprises.
                    </p>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                        <button
                            onClick={() => navigate("/login?mode=signup")}
                            style={{ background: ACCENT, border: "none", borderRadius: "999px", color: "#fff", padding: "11px 28px", fontSize: "14px", fontWeight: 800, cursor: "pointer", fontFamily: '"Plus Jakarta Sans",sans-serif', boxShadow: "0 4px 20px rgba(232,25,44,0.35)" }}
                            onMouseEnter={e => e.currentTarget.style.opacity = "0.86"}
                            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                        >
                            Start Free Trial →
                        </button>
                        <button
                            onClick={() => navigate("/pricing")}
                            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.13)", borderRadius: "999px", color: "rgba(220,225,255,0.65)", padding: "11px 28px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: '"Plus Jakarta Sans",sans-serif' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)"; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.13)"; e.currentTarget.style.color = "rgba(220,225,255,0.65)"; }}
                        >
                            View Pricing
                        </button>
                    </div>
                </Reveal>
            </section>

            {/* Divider */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "0 40px" }} />

            {/* Grid */}
            <section style={{ maxWidth: "1080px", margin: "0 auto", padding: "72px 40px 100px" }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "20px",
                }}>
                    {FEATURES.map((f, i) => (
                        <Reveal key={f.title} delay={i * 60}>
                            <FeatureCard {...f} />
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: "0 40px 100px", textAlign: "center" }}>
                <Reveal>
                    <div style={{
                        maxWidth: "560px", margin: "0 auto",
                        padding: "48px 36px",
                        background: "rgba(232,25,44,0.04)",
                        border: "1px solid rgba(232,25,44,0.15)",
                        borderRadius: "20px",
                    }}>
                        <h2 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 12px", color: "#f0f2fc" }}>
                            Ready to see it live?
                        </h2>
                        <p style={{ fontSize: "14px", color: "rgba(220,225,255,0.4)", lineHeight: 1.75, margin: "0 0 28px" }}>
                            14-day free trial — no credit card required.
                        </p>
                        <button
                            onClick={() => navigate("/login?mode=signup")}
                            style={{ background: ACCENT, border: "none", borderRadius: "999px", color: "#fff", padding: "12px 32px", fontSize: "15px", fontWeight: 800, cursor: "pointer", fontFamily: '"Plus Jakarta Sans",sans-serif', boxShadow: "0 4px 20px rgba(232,25,44,0.35)" }}
                            onMouseEnter={e => e.currentTarget.style.opacity = "0.86"}
                            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                        >
                            Get Started Free →
                        </button>
                    </div>
                </Reveal>
            </section>
        </div>
    );
}
