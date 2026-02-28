import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StarField from "../components/StarField";

const ACCENT = "#e8192c";

export default function AuthPage() {
    const [tab, setTab] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login, signup } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError(""); setLoading(true);
        await new Promise(r => setTimeout(r, 350));

        const result = tab === "login"
            ? await login(email, password)
            : await signup(name, email, password);

        setLoading(false);
        if (result.error) { setError(result.error); return; }
        // Request browser notification permission after successful auth
        if (typeof Notification !== "undefined" && Notification.permission === "default") {
            Notification.requestPermission();
        }
        navigate("/dashboard");
    }

    return (
        <div style={{ minHeight: "100vh", background: "#060608", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <StarField />

            {/* ── Same fixed nav bar as landing page — logo at identical coordinates ── */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, height: "64px",
                display: "flex", alignItems: "center", padding: "0 40px",
                background: "transparent",
            }}>
                <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <img
                        src="/logo.png"
                        alt="fsociety"
                        style={{ height: "56px", width: "56px", objectFit: "contain", imageRendering: "-webkit-optimize-contrast" }}
                        onError={e => e.target.style.display = "none"}
                    />
                </div>
            </nav>

            {/* Card */}
            <div style={{
                position: "relative", zIndex: 10,
                background: "rgba(13,13,18,0.90)",
                border: "1px solid rgba(232,25,44,0.18)",
                backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                borderRadius: "24px", padding: "40px 44px",
                width: "100%", maxWidth: "400px",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.6)",
            }}>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "4px", marginBottom: "28px" }}>
                    {["login", "signup"].map(t => (
                        <button key={t} onClick={() => { setTab(t); setError(""); }}
                            style={{
                                flex: 1, border: "none", borderRadius: "9px", padding: "9px",
                                cursor: "pointer", fontFamily: '"Plus Jakarta Sans",sans-serif',
                                fontSize: "13px", fontWeight: 700, transition: "all 0.18s",
                                background: tab === t ? ACCENT : "transparent",
                                color: tab === t ? "#ffffff" : "rgba(255,255,255,0.45)",
                            }}>
                            {t === "login" ? "Log In" : "Sign Up"}
                        </button>
                    ))}
                </div>

                <h2 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: 800, color: "#f0f2fc", fontFamily: '"Plus Jakarta Sans",sans-serif', letterSpacing: "-0.03em" }}>
                    {tab === "login" ? "Welcome back" : "Create your account"}
                </h2>
                <p style={{ margin: "0 0 24px", fontSize: "13px", color: "rgba(220,225,255,0.4)", fontFamily: '"Plus Jakarta Sans",sans-serif' }}>
                    {tab === "login"
                        ? "Enter your credentials to access the dashboard."
                        : "Get started — it only takes a few seconds."}
                </p>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {tab === "signup" && (
                        <Field label="Full Name" value={name} onChange={setName} placeholder="Jane Smith" required />
                    )}
                    <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" required />
                    <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />

                    {error && (
                        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: "#f87171", fontFamily: '"Plus Jakarta Sans",sans-serif' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" disabled={loading} style={{
                        marginTop: "6px",
                        background: loading ? "rgba(232,25,44,0.4)" : ACCENT,
                        border: "none", borderRadius: "12px", padding: "13px",
                        fontFamily: '"Plus Jakarta Sans",sans-serif', fontSize: "14px", fontWeight: 800,
                        color: "#ffffff", cursor: loading ? "not-allowed" : "pointer",
                        transition: "all 0.18s",
                        boxShadow: loading ? "none" : "0 4px 20px rgba(232,25,44,0.35)",
                    }}>
                        {loading ? "Please wait…" : (tab === "login" ? "Log In →" : "Create Account →")}
                    </button>
                </form>

                <div style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "rgba(220,225,255,0.35)", fontFamily: '"Plus Jakarta Sans",sans-serif' }}>
                    {tab === "login" ? "First time here? " : "Already have an account? "}
                    <span onClick={() => { setTab(tab === "login" ? "signup" : "login"); setError(""); }}
                        style={{ color: ACCENT, cursor: "pointer", fontWeight: 700 }}>
                        {tab === "login" ? "Sign Up" : "Log In"}
                    </span>
                </div>
            </div>
        </div>
    );
}

function Field({ label, type = "text", value, onChange, placeholder, required }) {
    return (
        <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "rgba(220,225,255,0.45)", marginBottom: "6px", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: '"Plus Jakarta Sans",sans-serif' }}>
                {label}
            </label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)}
                placeholder={placeholder} required={required}
                style={{
                    width: "100%", boxSizing: "border-box",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px", padding: "11px 14px",
                    color: "#f0f2fc", fontSize: "14px", fontFamily: '"Plus Jakarta Sans",sans-serif',
                    outline: "none", transition: "border-color 0.15s",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(232,25,44,0.5)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
        </div>
    );
}
