import { useNavigate } from "react-router-dom";
import StarField from "../components/StarField";

const ACCENT = "#e8192c";

const SERVICES = [
    { name: "IoT Dashboard", desc: "Real-time sensor monitoring UI", status: "maintenance" },
    { name: "Telemetry Backend", desc: "WebSocket sensor data stream", status: "maintenance" },
    { name: "Auth API", desc: "Login, signup, session management", status: "maintenance" },
    { name: "Alert Engine", desc: "Threshold detection & notifications", status: "maintenance" },
    { name: "Financial Automation", desc: "P&L linkage and cost prediction", status: "coming_soon" },
    { name: "Mobile App", desc: "On-floor technician app", status: "coming_soon" },
];

const STATUS_META = {
    operational: { label: "Operational", color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)" },
    maintenance: { label: "Beta Paused", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
    outage: { label: "Outage", color: "#e8192c", bg: "rgba(232,25,44,0.1)", border: "rgba(232,25,44,0.25)" },
    coming_soon: { label: "Coming Soon", color: "rgba(220,225,255,0.4)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)" },
};

export default function StatusPage() {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: "100vh", background: "#060608", color: "#f0f2fc", fontFamily: '"Plus Jakarta Sans",sans-serif', position: "relative" }}>
            <StarField />

            {/* Nav */}
            <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, height: "64px", display: "flex", alignItems: "center", padding: "0 40px", background: "rgba(6,6,8,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <img src="/logo.png" alt="fsociety" style={{ height: "44px", width: "44px", objectFit: "contain" }} onError={e => e.target.style.display = "none"} />
                </div>
                <div style={{ flex: 1 }} />
                <button onClick={() => navigate(-1)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "999px", color: "rgba(220,225,255,0.6)", padding: "6px 18px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: '"Plus Jakarta Sans",sans-serif' }}>
                    ← Back
                </button>
            </nav>

            <div style={{ maxWidth: "720px", margin: "0 auto", padding: "110px 32px 80px", position: "relative", zIndex: 1 }}>
                {/* Header */}
                <span style={{ display: "inline-block", fontSize: "11px", fontWeight: 700, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>Platform Status</span>
                <h1 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, margin: "0 0 12px" }}>System Status</h1>

                {/* Overall status banner */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "14px", padding: "16px 20px", marginBottom: "40px", marginTop: "20px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b", flexShrink: 0, animation: "pulse 2s ease-in-out infinite" }} />
                    <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: "#f0f2fc" }}>Beta Currently Paused</p>
                        <p style={{ margin: 0, fontSize: "13px", color: "rgba(220,225,255,0.45)", marginTop: "3px" }}>
                            The fsociety platform is in closed beta. All services are under active development. Public access will resume with the official launch.
                        </p>
                    </div>
                </div>

                {/* Service list */}
                <h2 style={{ fontSize: "13px", fontWeight: 700, color: "rgba(220,225,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px" }}>Services</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {SERVICES.map(svc => {
                        const meta = STATUS_META[svc.status];
                        return (
                            <div key={svc.name} style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "14px 20px", gap: "16px" }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "#f0f2fc" }}>{svc.name}</p>
                                    <p style={{ margin: 0, fontSize: "12px", color: "rgba(220,225,255,0.4)", marginTop: "2px" }}>{svc.desc}</p>
                                </div>
                                <span style={{ fontSize: "11px", fontWeight: 700, color: meta.color, background: meta.bg, border: `1px solid ${meta.border}`, borderRadius: "999px", padding: "4px 12px", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                                    {meta.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Info note */}
                <p style={{ fontSize: "12px", color: "rgba(220,225,255,0.25)", marginTop: "32px", lineHeight: 1.7 }}>
                    For access requests or status inquiries, contact us at{" "}
                    <a href="mailto:explainersenpai@gmail.com" style={{ color: ACCENT, textDecoration: "none" }}>explainersenpai@gmail.com</a>.
                    Updates will be posted here when the beta resumes.
                </p>
            </div>

            <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.3)} }`}</style>
        </div>
    );
}
