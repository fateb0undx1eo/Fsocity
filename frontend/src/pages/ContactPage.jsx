import { useNavigate } from "react-router-dom";
import StarField from "../components/StarField";
import PublicNav from "../components/PublicNav";

const ACCENT = "#e8192c";

export default function ContactPage() {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: "100vh",
            background: "#060608",
            color: "#f0f2fc",
            fontFamily: '"Plus Jakarta Sans",sans-serif',
            overflowX: "hidden",
        }}>
            <StarField />
            <PublicNav alwaysFilled />

            <main style={{
                maxWidth: "640px",
                margin: "0 auto",
                padding: "130px 32px 100px",
                position: "relative",
                zIndex: 1,
            }}>
                {/* Header */}
                <p style={{ fontSize: "11px", fontWeight: 700, color: ACCENT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px", margin: "0 0 14px" }}>
                    Get in Touch
                </p>
                <h1 style={{
                    fontSize: "clamp(32px,4.5vw,52px)",
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    lineHeight: 1.1,
                    margin: "0 0 16px",
                    color: "#f0f2fc",
                }}>
                    We'd love to hear<br />from you.
                </h1>
                <p style={{ fontSize: "15px", color: "rgba(220,225,255,0.45)", lineHeight: 1.75, margin: "0 0 56px" }}>
                    We're a small team — responses are fast. Whether it's a custom plan, a technical question, or just a hello, reach out below.
                </p>

                {/* Contact cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Email */}
                    <a
                        href="mailto:explainersenpai@gmail.com?subject=Hello%20from%20fsociety"
                        style={{ textDecoration: "none" }}
                    >
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "20px",
                            padding: "24px 28px",
                            background: "rgba(255,255,255,0.025)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: "16px",
                            transition: "border-color 0.2s, background 0.2s",
                            cursor: "pointer",
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(232,25,44,0.05)"; e.currentTarget.style.borderColor = "rgba(232,25,44,0.3)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
                        >
                            <div style={{
                                width: 44, height: 44, borderRadius: 12,
                                background: "rgba(232,25,44,0.1)",
                                border: "1px solid rgba(232,25,44,0.2)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </div>
                            <div>
                                <p style={{ fontSize: "12px", color: "rgba(220,225,255,0.35)", margin: "0 0 3px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Email</p>
                                <p style={{ fontSize: "15px", fontWeight: 700, color: "#f0f2fc", margin: 0 }}>explainersenpai@gmail.com</p>
                            </div>
                        </div>
                    </a>

                    {/* GitHub */}
                    <a
                        href="https://github.com/fateb0undx1eo"
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "none" }}
                    >
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "20px",
                            padding: "24px 28px",
                            background: "rgba(255,255,255,0.025)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: "16px",
                            transition: "border-color 0.2s, background 0.2s",
                            cursor: "pointer",
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(232,25,44,0.05)"; e.currentTarget.style.borderColor = "rgba(232,25,44,0.3)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
                        >
                            <div style={{
                                width: 44, height: 44, borderRadius: 12,
                                background: "rgba(232,25,44,0.1)",
                                border: "1px solid rgba(232,25,44,0.2)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                                </svg>
                            </div>
                            <div>
                                <p style={{ fontSize: "12px", color: "rgba(220,225,255,0.35)", margin: "0 0 3px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>GitHub</p>
                                <p style={{ fontSize: "15px", fontWeight: 700, color: "#f0f2fc", margin: 0 }}>github.com/fateb0undx1eo</p>
                            </div>
                        </div>
                    </a>

                    {/* Custom plan enquiry */}
                    <div
                        onClick={() => window.location.href = "mailto:explainersenpai@gmail.com?subject=Custom%20Plan%20Enquiry"}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "20px",
                            padding: "24px 28px",
                            background: "rgba(232,25,44,0.04)",
                            border: "1px solid rgba(232,25,44,0.2)",
                            borderRadius: "16px",
                            transition: "border-color 0.2s, background 0.2s",
                            cursor: "pointer",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(232,25,44,0.08)"; e.currentTarget.style.borderColor = "rgba(232,25,44,0.4)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(232,25,44,0.04)"; e.currentTarget.style.borderColor = "rgba(232,25,44,0.2)"; }}
                    >
                        <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: "rgba(232,25,44,0.14)",
                            border: "1px solid rgba(232,25,44,0.3)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <div>
                            <p style={{ fontSize: "12px", color: "rgba(220,225,255,0.35)", margin: "0 0 3px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Custom Plans</p>
                            <p style={{ fontSize: "15px", fontWeight: 700, color: "#f0f2fc", margin: 0 }}>Enquire about a custom solution →</p>
                        </div>
                    </div>
                </div>

                {/* Footer note */}
                <p style={{ fontSize: "12px", color: "rgba(220,225,255,0.2)", marginTop: "40px", lineHeight: 1.7, textAlign: "center" }}>
                    We typically reply within 24 hours · We prefer to stay anonymous, but we're always reachable.
                </p>
            </main>
        </div>
    );
}
