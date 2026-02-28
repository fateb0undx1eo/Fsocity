import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import StarField from "../components/StarField";
import PublicNav from "../components/PublicNav";

const ACCENT = "#e8192c";

// ── Fake data ─────────────────────────────────────────────────────────────────
const PARTNERS = [
    { name: "FinCore Tech", abbr: "FC" },
    { name: "Synthex Industries", abbr: "SI" },
    { name: "NexaFlow", abbr: "NF" },
    { name: "Orbis Systems", abbr: "OS" },
    { name: "QuantumEdge", abbr: "QE" },
    { name: "Meridian Corp", abbr: "MC" },
    { name: "Apex Dynamics", abbr: "AD" },
    { name: "Zenith Analytics", abbr: "ZA" },
    { name: "Luminary Ltd", abbr: "LL" },
    { name: "Vantage AI", abbr: "VA" },
];

const REVIEWS = [
    { name: "Aryan Mehta", role: "CTO, FinCore Tech", text: "fsociety transformed how we monitor our factory lines. Real-time alerts cut our downtime by 70%.", stars: 5 },
    { name: "Priya Kapoor", role: "VP Ops, NexaFlow", text: "The custom machine profiles gave us exactly the visibility we needed. Deployable in hours, not weeks.", stars: 5 },
    { name: "Luca Romano", role: "Head of Infra, Orbis", text: "The Grafana-style charts and threshold alerts are incredibly polished. Our team adopted it on day one.", stars: 5 },
    { name: "Sara Chen", role: "CEO, Vantage AI", text: "Financial automation on top of live sensor data — we couldn't find anything else that combined both.", stars: 5 },
    { name: "David Osei", role: "Operations, Apex Dynamics", text: "The partner support was outstanding. Custom sensors were programmed for our legacy machines within a week.", stars: 5 },
    { name: "Mei Watanabe", role: "CTO, Zenith Analytics", text: "Smooth, beautiful UI with real intelligence underneath. fsociety is the future of industrial monitoring.", stars: 5 },
];

const IC = ({ d, viewBox = "0 0 24 24" }) => (
    <svg width="22" height="22" viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

const FEATURES = [
    {
        icon: <IC d={<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></>} />,
        title: "Real-Time Sensor Monitoring",
        desc: "Stream live data from thousands of sensors across all your machines. Temperature, pressure, RPM, vibration — tracked the moment it changes.",
    },
    {
        icon: <IC d={<><circle cx="12" cy="12" r="10" /><path d="M14.5 7.5H10a2.5 2.5 0 0 0 0 5h4a2.5 2.5 0 0 1 0 5H9" /><line x1="12" y1="6" x2="12" y2="7.5" /><line x1="12" y1="17.5" x2="12" y2="19" /></>} />,
        title: "Financial Automation",
        desc: "Link operational data directly to your P&L. Automatic alerts when sensor thresholds predict costly failures — before they happen.",
    },
    {
        icon: <IC d={<><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></>} />,
        title: "Custom Machine Profiles",
        desc: "Every client gets machines programmed exclusively for them. Bring your own hardware or use our certified sensor kits — full white-glove setup.",
    },
    {
        icon: <IC d={<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>} />,
        title: "Intelligent Alerting",
        desc: "Multi-tier warnings (Normal / Warning / Critical) with notification routing. Never miss a threshold breach again.",
    },
    {
        icon: <IC d={<><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>} />,
        title: "Historical Reports",
        desc: "1h, 7d, 30d trend charts with exportable reports. Understand patterns, plan maintenance, and prove ROI to stakeholders.",
    },
    {
        icon: <IC d={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>} />,
        title: "Enterprise Security",
        desc: "Role-based access, encrypted sessions, and audit logs. Your operational data stays yours — always.",
    },
];

const STATS = [
    { value: "2,400+", label: "Active Sensors Deployed" },
    { value: "99.9%", label: "Platform Uptime" },
    { value: "₹18Cr+", label: "Downtime Cost Prevented" },
];

// ── Scroll-reveal hook ────────────────────────────────────────────────────────
function useReveal() {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return { ref, visible };
}

function Reveal({ children, delay = 0, style = {} }) {
    const { ref, visible } = useReveal();
    return (
        <div ref={ref} style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(36px)",
            transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
            ...style,
        }}>
            {children}
        </div>
    );
}

// ── Landing page ──────────────────────────────────────────────────────────────
export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div style={{ background: "#060608", color: "#f0f2fc", fontFamily: '"Plus Jakarta Sans",sans-serif', overflowX: "hidden" }}>
            <StarField />

            {/* ── NAV ────────────────────────────────────────────────── */}
            <PublicNav />

            {/* ── HERO ───────────────────────────────────────────────── */}
            <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 24px 80px", textAlign: "center" }}>
                <div style={{ position: "relative", zIndex: 1, maxWidth: "820px" }}>
                    <Reveal>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(232,25,44,0.1)", border: "1px solid rgba(232,25,44,0.25)", borderRadius: "999px", padding: "6px 18px", fontSize: "12px", fontWeight: 700, color: ACCENT, letterSpacing: "0.07em", marginBottom: "28px" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, display: "inline-block", animation: "pulse 2s ease-in-out infinite" }} />
                            NOW IN CLOSED BETA
                        </div>
                    </Reveal>

                    <Reveal delay={80}>
                        <h1 style={{ fontSize: "clamp(38px,6vw,80px)", fontWeight: 900, lineHeight: 1.06, letterSpacing: "-0.04em", margin: "0 0 24px", background: "linear-gradient(135deg,#ffffff 40%,rgba(255,255,255,0.55))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            Industrial Intelligence<br />
                            <span style={{ background: `linear-gradient(90deg,${ACCENT},#ff4a5a)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                Meets Financial Precision.
                            </span>
                        </h1>
                    </Reveal>

                    <Reveal delay={160}>
                        <p style={{ fontSize: "17px", color: "rgba(220,225,255,0.55)", lineHeight: 1.7, maxWidth: "580px", margin: "0 auto 40px" }}>
                            fsociety connects your machines to your money. Real-time IoT sensor monitoring with financial automation — built for companies that cannot afford surprises.
                        </p>
                    </Reveal>

                    <Reveal delay={240}>
                        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
                            <button onClick={() => navigate("/login?mode=signup")} style={btnPrimary}>
                                Get Started Free →
                            </button>
                            <button onClick={() => navigate("/login")} style={btnSecondary}>
                                Log In
                            </button>
                        </div>
                    </Reveal>
                </div>

                {/* Glow blob */}
                <div style={{ position: "absolute", bottom: "-80px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse,rgba(232,25,44,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
            </section>

            {/* ── PARTNER MARQUEE ───────────────────────────────────── */}
            <section style={{ padding: "60px 0", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
                <Reveal>
                    <p style={{ textAlign: "center", fontSize: "11px", color: "rgba(220,225,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "32px", fontWeight: 700 }}>
                        Trusted by forward-thinking companies
                    </p>
                </Reveal>

                {/* Fade masks */}
                <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "120px", background: "linear-gradient(to right,#060608,transparent)", zIndex: 2, pointerEvents: "none" }} />
                <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "120px", background: "linear-gradient(to left,#060608,transparent)", zIndex: 2, pointerEvents: "none" }} />

                {/* Marquee track */}
                <div style={{ display: "flex", overflow: "hidden" }}>
                    <div style={{ display: "flex", gap: "40px", animation: "marquee 22s linear infinite", whiteSpace: "nowrap" }}>
                        {[...PARTNERS, ...PARTNERS].map((p, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, opacity: 0.55 }}>
                                <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: `rgba(232,25,44,0.1)`, border: "1px solid rgba(232,25,44,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color: ACCENT, letterSpacing: "0.03em" }}>
                                    {p.abbr}
                                </div>
                                <span style={{ fontSize: "15px", fontWeight: 700, color: "rgba(240,242,252,0.8)", letterSpacing: "-0.01em" }}>{p.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES teaser — removed from home, lives on /features ── */}

            {/* ── STATS ────────────────────────────────────────────── */}
            <section style={{ padding: "80px 40px", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "40px", textAlign: "center" }}>
                    {STATS.map((s, i) => (
                        <Reveal key={s.label} delay={i * 100}>
                            <div>
                                <div style={{ fontSize: "clamp(36px,5vw,56px)", fontWeight: 900, color: ACCENT, letterSpacing: "-0.04em", lineHeight: 1 }}>{s.value}</div>
                                <div style={{ fontSize: "13px", color: "rgba(220,225,255,0.45)", marginTop: "8px", fontWeight: 600 }}>{s.label}</div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ── PRICING ───────────────────────────────────────────── */}
            <PricingSection navigate={navigate} />

            {/* ── WHO WE ARE (teaser — full content on /about) ─────── */}
            <section style={{ padding: "80px 40px", maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>
                <Reveal>
                    <SectionLabel>Who We Are</SectionLabel>
                    <h2 style={h2Style}>Built by engineers,<br />for engineers.</h2>
                    <p style={{ fontSize: "16px", color: "rgba(220,225,255,0.5)", lineHeight: 1.8, marginTop: "20px", marginBottom: "28px" }}>
                        fsociety is a small, focused team that believes every factory-floor decision should be backed by real data.
                        We bridge the gap between machinery and management — and we prefer to let the work speak for itself.
                    </p>
                    <button onClick={() => navigate("/about")}
                        style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "999px", color: "rgba(220,225,255,0.7)", padding: "9px 24px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: '"Plus Jakarta Sans",sans-serif', transition: "all 0.18s" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "rgba(220,225,255,0.7)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
                    >Our story →</button>
                </Reveal>
            </section>

            {/* ── INTEGRATIONS ──────────────────────────────────────── */}
            <IntegrationsSection />

            {/* ── REVIEWS ──────────────────────────────────────────── */}
            <section style={{ padding: "100px 40px", maxWidth: "1100px", margin: "0 auto" }}>
                <Reveal>
                    <SectionLabel>Customer Reviews</SectionLabel>
                    <h2 style={h2Style}>Trusted by teams who can't afford downtime.</h2>
                </Reveal>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: "20px", marginTop: "56px" }}>
                    {REVIEWS.map((r, i) => (
                        <Reveal key={r.name} delay={i * 70}>
                            <ReviewCard {...r} />
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ── CTA BANNER ───────────────────────────────────────── */}
            <section style={{ padding: "80px 40px", textAlign: "center" }}>
                <Reveal>
                    <div style={{ maxWidth: "660px", margin: "0 auto", padding: "60px 48px", background: "rgba(232,25,44,0.05)", border: "1px solid rgba(232,25,44,0.18)", borderRadius: "28px" }}>
                        <h2 style={{ ...h2Style, marginTop: 0 }}>Ready to see your machines<br />in real time?</h2>
                        <p style={{ fontSize: "15px", color: "rgba(220,225,255,0.45)", marginBottom: "32px", lineHeight: 1.7 }}>
                            Join companies already saving crores with fsociety.
                        </p>
                        <button onClick={() => navigate("/login?mode=signup")} style={{ ...btnPrimary, fontSize: "15px", padding: "14px 36px" }}>
                            Start for Free →
                        </button>
                    </div>
                </Reveal>
            </section>

            {/* ── FOOTER ───────────────────────────────────────────── */}
            <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "48px 40px 32px", position: "relative", overflow: "hidden" }}>
                {/* Red glow — bottom-left corner */}
                <div style={{ position: "absolute", bottom: 0, left: 0, width: "40%", height: "280px", background: "radial-gradient(ellipse 100% 100% at 0% 100%, rgba(232,25,44,0.22) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
                {/* Red glow — bottom-right corner */}
                <div style={{ position: "absolute", bottom: 0, right: 0, width: "40%", height: "280px", background: "radial-gradient(ellipse 100% 100% at 100% 100%, rgba(232,25,44,0.22) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
                <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "36px", marginBottom: "48px" }}>

                        {/* Brand — logo links to home */}
                        <div>
                            <div
                                onClick={() => navigate("/")}
                                style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "12px", cursor: "pointer" }}
                            >
                                <img src="/logo.png" alt="fsociety" style={{ height: "56px", width: "56px", objectFit: "contain" }} onError={e => e.target.style.display = "none"} />
                            </div>
                            <p style={{ fontSize: "12px", color: "rgba(220,225,255,0.35)", lineHeight: 1.7 }}>Financial automation<br />meets industrial IoT.</p>
                        </div>

                        {/* Product links */}
                        <div>
                            <p style={footerTitle}>Product</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {[
                                    ["Dashboard", "/dashboard"],
                                    ["Features", "/features"],
                                    ["Pricing", "/pricing"],
                                    ["Changelog", null],
                                ].map(([label, path]) => (
                                    <span key={label}
                                        onClick={path ? () => navigate(path) : undefined}
                                        style={{ fontSize: "13px", color: "rgba(220,225,255,0.45)", cursor: path ? "pointer" : "default", transition: "color 0.15s" }}
                                        onMouseEnter={e => { if (path) e.target.style.color = ACCENT; }}
                                        onMouseLeave={e => { e.target.style.color = "rgba(220,225,255,0.45)"; }}
                                    >{label}</span>
                                ))}
                            </div>
                        </div>

                        {/* Company links */}
                        <div>
                            <p style={footerTitle}>Company</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {[
                                    ["About Us", "/about"],
                                    ["Careers", null],
                                    ["Press Kit", null],
                                ].map(([label, path]) => (
                                    <span key={label}
                                        onClick={path ? () => navigate(path) : undefined}
                                        style={{ fontSize: "13px", color: "rgba(220,225,255,0.45)", cursor: path ? "pointer" : "default", transition: "color 0.15s" }}
                                        onMouseEnter={e => { if (path) e.target.style.color = ACCENT; }}
                                        onMouseLeave={e => { e.target.style.color = "rgba(220,225,255,0.45)"; }}
                                    >{label}</span>
                                ))}
                            </div>
                        </div>

                        {/* Support links */}
                        <div>
                            <p style={footerTitle}>Support</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {[
                                    ["Status Page", "/status"],
                                    ["Contact Us", "/contact"],
                                    ["Community", null],
                                ].map(([label, path]) => (
                                    <span key={label}
                                        onClick={path ? () => navigate(path) : undefined}
                                        style={{ fontSize: "13px", color: "rgba(220,225,255,0.45)", cursor: path ? "pointer" : "default", transition: "color 0.15s" }}
                                        onMouseEnter={e => { if (path) e.target.style.color = ACCENT; }}
                                        onMouseLeave={e => { e.target.style.color = "rgba(220,225,255,0.45)"; }}
                                    >{label}</span>
                                ))}
                            </div>
                        </div>

                        {/* Follow us */}
                        <div>
                            <p style={footerTitle}>Follow Us</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <a href="https://github.com/fateb0undx1eo" target="_blank" rel="noreferrer"
                                    style={{ fontSize: "13px", color: "rgba(220,225,255,0.45)", textDecoration: "none", transition: "color 0.15s" }}
                                    onMouseEnter={e => e.target.style.color = ACCENT}
                                    onMouseLeave={e => e.target.style.color = "rgba(220,225,255,0.45)"}
                                >GitHub</a>
                                <span style={{ fontSize: "12px", color: "rgba(220,225,255,0.2)", fontStyle: "italic" }}>Socials coming soon</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                        <p style={{ fontSize: "12px", color: "rgba(220,225,255,0.25)", margin: 0 }}>
                            © 2026 fsociety. All rights reserved.
                        </p>
                        <div style={{ display: "flex", gap: "20px" }}>
                            {[
                                ["Privacy Policy", "/privacy"],
                                ["Terms of Service", "/terms"],
                                ["Cookie Policy", "/cookies"],
                            ].map(([label, path]) => (
                                <span key={label}
                                    onClick={() => navigate(path)}
                                    style={{ fontSize: "12px", color: "rgba(220,225,255,0.3)", cursor: "pointer", transition: "color 0.15s" }}
                                    onMouseEnter={e => e.target.style.color = ACCENT}
                                    onMouseLeave={e => e.target.style.color = "rgba(220,225,255,0.3)"}
                                >{label}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

            <style>{`
        @keyframes marquee { from { transform:translateX(0) } to { transform:translateX(-50%) } }
        @keyframes marqueeRev { from { transform:translateX(-50%) } to { transform:translateX(0) } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
      `}</style>
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────


function FeatureCard({ icon, title, desc }) {
    const [hov, setHov] = useState(false);
    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{ background: hov ? "rgba(232,25,44,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${hov ? "rgba(232,25,44,0.25)" : "rgba(255,255,255,0.07)"}`, borderRadius: "18px", padding: "28px", transition: "all 0.25s", cursor: "default" }}>
            <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: hov ? "rgba(232,25,44,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${hov ? "rgba(232,25,44,0.3)" : "rgba(255,255,255,0.08)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "18px",
                color: hov ? "#e8192c" : "rgba(240,242,252,0.7)",
                transition: "all 0.25s",
            }}>
                {icon}
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#f0f2fc", margin: "0 0 10px", letterSpacing: "-0.02em" }}>{title}</h3>
            <p style={{ fontSize: "13.5px", color: "rgba(220,225,255,0.5)", lineHeight: 1.75, margin: 0 }}>{desc}</p>
        </div>
    );
}

function ReviewCard({ name, role, text, stars }) {
    return (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "18px", padding: "24px" }}>
            <div style={{ display: "flex", gap: "2px", marginBottom: "14px" }}>
                {Array.from({ length: stars }).map((_, i) => <span key={i} style={{ color: "#fbbf24", fontSize: "14px" }}>★</span>)}
            </div>
            <p style={{ fontSize: "13.5px", color: "rgba(220,225,255,0.65)", lineHeight: 1.75, margin: "0 0 18px", fontStyle: "italic" }}>"{text}"</p>
            <div>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#f0f2fc" }}>{name}</p>
                <p style={{ margin: 0, fontSize: "11px", color: "rgba(220,225,255,0.4)", marginTop: "2px" }}>{role}</p>
            </div>
        </div>
    );
}

function SectionLabel({ children }) {
    return <p style={{ fontSize: "11px", color: ACCENT, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>{children}</p>;
}

function FooterCol({ title, links }) {
    return (
        <div>
            <p style={footerTitle}>{title}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {links.map(l => (
                    <a key={l} href="#" style={{ fontSize: "13px", color: "rgba(220,225,255,0.45)", textDecoration: "none", transition: "color 0.15s" }}
                        onMouseEnter={e => e.target.style.color = ACCENT}
                        onMouseLeave={e => e.target.style.color = "rgba(220,225,255,0.45)"}>
                        {l}
                    </a>
                ))}
            </div>
        </div>
    );
}


const PLANS = [
    {
        name: "Starter",
        tagline: "Monitor your first machines",
        monthly: 799,
        icon: "S",
        iconColor: "#60a5fa",
        cta: "Get Started Free",
        featured: false,
        custom: false,
        features: [
            "Up to 5 machines",
            "Up to 25 sensors",
            "Real-time dashboard",
            "Email threshold alerts",
            "7-day sensor history",
            "PDF reports",
            "Community support",
        ],
    },
    {
        name: "Growth",
        tagline: "Scale monitoring across your floor",
        monthly: 2499,
        icon: "G",
        iconColor: "#e8192c",
        cta: "Start 14-day Trial",
        featured: true,
        custom: false,
        features: [
            "Up to 25 machines",
            "Up to 200 sensors",
            "Financial automation (P&L link)",
            "Custom machine profiles",
            "30-day sensor history",
            "Predictive maintenance (beta)",
            "Priority email + chat support",
            "REST API access",
        ],
    },
    {
        name: "Scale",
        tagline: "Full-floor visibility & automation",
        monthly: 6999,
        icon: "X",
        iconColor: "#a78bfa",
        cta: "Contact Sales",
        featured: false,
        custom: false,
        features: [
            "Up to 100 machines",
            "Up to 2,000 sensors",
            "Everything in Growth",
            "Multi-site support",
            "Unlimited sensor history",
            "ERP / SCADA integrations",
            "Dedicated account manager",
            "Custom SLA guarantee",
        ],
    },
    {
        name: "Custom",
        tagline: "Built exactly for your operation",
        monthly: null,
        icon: "C",
        iconColor: "#34d399",
        cta: "Talk to Us",
        featured: false,
        custom: true,
        features: [
            "Unlimited machines & sensors",
            "On-premise deployment option",
            "Hardware + sensor procurement",
            "White-glove on-site setup",
            "Custom firmware & protocols",
            "24/7 dedicated engineering support",
            "NDA + custom contract",
        ],
    },
];

function PlanCard({ plan, yearly, navigate }) {
    const [hov, setHov] = useState(false);

    const accentCol = plan.featured ? "#e8192c"
        : plan.custom ? "#34d399"
            : plan.name === "Starter" ? "#60a5fa"
                : "#a78bfa";

    const liftY = plan.featured ? (hov ? -14 : -7) : hov ? -8 : 0;
    const displayPrice = plan.custom ? null : (yearly ? Math.round(plan.monthly * 12 * 0.80) : plan.monthly);

    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                borderRadius: 20,
                padding: "28px 24px 24px",
                background: hov
                    ? `${accentCol}08`
                    : plan.featured ? "rgba(232,25,44,0.04)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${hov ? `${accentCol}50`
                    : plan.featured ? "rgba(232,25,44,0.35)" : "rgba(255,255,255,0.07)"
                    }`,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                boxSizing: "border-box",
                transform: `translateY(${liftY}px)`,
                transition: "transform 0.38s cubic-bezier(0.34,1.56,0.64,1), border-color 0.25s, background 0.25s, box-shadow 0.35s",
                boxShadow: hov
                    ? `0 28px 60px rgba(0,0,0,0.5), 0 0 0 1px ${accentCol}18`
                    : plan.featured ? "0 0 40px rgba(232,25,44,0.07)" : "none",
                cursor: "default",
                zIndex: hov ? 2 : plan.featured ? 1 : 0,
            }}
        >
            {/* Most popular badge */}
            {plan.featured && (
                <div style={{
                    position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                    background: "#e8192c", borderRadius: "999px", padding: "4px 16px",
                    fontSize: "10px", fontWeight: 800, color: "#fff", letterSpacing: "0.1em",
                    whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(232,25,44,0.4)",
                    textTransform: "uppercase",
                }}>Most Popular</div>
            )}

            {/* Plan name + tagline */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: `${accentCol}18`, border: `1px solid ${accentCol}30`,
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 900, color: accentCol,
                        fontFamily: '"Plus Jakarta Sans",sans-serif', flexShrink: 0,
                    }}>{plan.icon}</span>
                    <span style={{ fontSize: 17, fontWeight: 800, color: "#f0f2fc", letterSpacing: "-0.03em" }}>{plan.name}</span>
                </div>
                <p style={{ fontSize: 12.5, color: "rgba(220,225,255,0.4)", margin: 0, lineHeight: 1.5 }}>{plan.tagline}</p>
            </div>

            {/* Price block — fixed height so all cards align */}
            <div style={{ height: 72, marginBottom: 20, display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
                {plan.custom ? (
                    <>
                        <span style={{ fontSize: 40, fontWeight: 900, color: "#f0f2fc", letterSpacing: "-0.04em", lineHeight: 1 }}>Custom</span>
                        <span style={{ fontSize: 12, color: "rgba(220,225,255,0.32)", marginTop: 6 }}>Quoted based on scope</span>
                    </>
                ) : (
                    <>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                            <span style={{ fontSize: 40, fontWeight: 900, color: "#f0f2fc", letterSpacing: "-0.04em", lineHeight: 1 }}>
                                ₹{displayPrice.toLocaleString("en-IN")}
                            </span>
                            <span style={{ fontSize: 13, color: "rgba(220,225,255,0.38)" }}>/{yearly ? "yr" : "mo"}</span>
                        </div>
                        {yearly ? (
                            <span style={{ fontSize: 11, color: "rgba(220,225,255,0.28)", marginTop: 5 }}>
                                ₹{Math.round(plan.monthly * 0.80).toLocaleString("en-IN")}/mo billed annually
                            </span>
                        ) : (
                            <span style={{ fontSize: 11, color: "rgba(220,225,255,0.22)", marginTop: 5 }}>per month, billed monthly</span>
                        )}
                    </>
                )}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 20 }} />

            {/* Features — flex:1 pushes CTA to bottom */}
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                {plan.features.map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13, color: "rgba(220,225,255,0.6)", lineHeight: 1.45 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                            stroke={plan.custom ? "#34d399" : plan.featured ? "#e8192c" : accentCol}
                            strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {f}
                    </li>
                ))}
            </ul>

            {/* CTA button */}
            <button
                onClick={() => plan.custom
                    ? window.location.href = "mailto:explainersenpai@gmail.com?subject=Custom%20Plan%20Enquiry"
                    : navigate("/login?mode=signup")
                }
                style={{
                    width: "100%", padding: "12px",
                    borderRadius: 10,
                    border: plan.featured ? "none" : plan.custom ? `1px solid rgba(52,211,153,0.3)` : `1px solid rgba(255,255,255,0.12)`,
                    background: plan.featured ? "#e8192c" : plan.custom ? "rgba(52,211,153,0.07)" : "transparent",
                    color: plan.featured ? "#fff" : plan.custom ? "#34d399" : "rgba(220,225,255,0.65)",
                    fontSize: 13.5, fontWeight: 700, cursor: "pointer",
                    fontFamily: '"Plus Jakarta Sans",sans-serif',
                    boxShadow: plan.featured ? "0 4px 20px rgba(232,25,44,0.28)" : "none",
                    transition: "opacity 0.18s, transform 0.18s",
                    letterSpacing: "0.01em",
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.8"; e.currentTarget.style.transform = "scale(1.015)"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
            >
                {plan.cta} →
            </button>
        </div>
    );
}

export function PricingSection({ navigate }) {
    const [yearly, setYearly] = useState(false);

    return (
        <section id="pricing" style={{ padding: "100px 40px", maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal>
                <SectionLabel>Pricing</SectionLabel>
                <h2 style={h2Style}>Transparent pricing.<br />No surprises.</h2>
                <p style={{ fontSize: "15px", color: "rgba(220,225,255,0.45)", marginTop: "14px", lineHeight: 1.7 }}>
                    Start small, scale as you grow. All plans include a 14-day free trial.
                </p>
            </Reveal>

            {/* Monthly / Yearly toggle */}
            <Reveal delay={80}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "36px", justifyContent: "center" }}>
                    <span style={{ fontSize: "13px", fontWeight: yearly ? 500 : 700, color: yearly ? "rgba(220,225,255,0.45)" : "#f0f2fc", transition: "color 0.2s" }}>Monthly</span>
                    <div onClick={() => setYearly(y => !y)} style={{ width: "44px", height: "24px", borderRadius: "999px", background: yearly ? ACCENT : "rgba(255,255,255,0.12)", position: "relative", cursor: "pointer", transition: "background 0.25s", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <div style={{ position: "absolute", top: "3px", left: yearly ? "22px" : "3px", width: "16px", height: "16px", borderRadius: "50%", background: "#fff", transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: yearly ? 700 : 500, color: yearly ? "#f0f2fc" : "rgba(220,225,255,0.45)", transition: "color 0.2s" }}>Yearly</span>
                    {yearly && <span style={{ fontSize: "11px", fontWeight: 800, color: ACCENT, background: "rgba(232,25,44,0.1)", border: "1px solid rgba(232,25,44,0.25)", borderRadius: "999px", padding: "3px 10px", letterSpacing: "0.05em" }}>SAVE 20%</span>}
                </div>
            </Reveal>

            {/* Cards grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "20px",
                marginTop: "64px",
                alignItems: "stretch",
            }}>
                {PLANS.map((plan, i) => (
                    <Reveal key={plan.name} delay={i * 80}>
                        <PlanCard plan={plan} yearly={yearly} navigate={navigate} />
                    </Reveal>
                ))}
            </div>

            <Reveal delay={200}>
                <p style={{ textAlign: "center", fontSize: "12px", color: "rgba(220,225,255,0.25)", marginTop: "36px", lineHeight: 1.7 }}>
                    All prices in INR · GST additional · Custom plans are contract-based
                </p>
            </Reveal>
        </section>
    );
}


// ── INTEGRATIONS SECTION ─────────────────────────────────────────────────────
const INT_ROW1 = [
    { label: "SAP ERP", cat: "Finance", icon: "SF" },
    { label: "AWS IoT Core", cat: "Cloud", icon: "AW" },
    { label: "SCADA Systems", cat: "Control", icon: "SC" },
    { label: "Modbus RTU", cat: "Protocol", icon: "MB" },
    { label: "OPC-UA", cat: "Protocol", icon: "OA" },
    { label: "Grafana", cat: "Analytics", icon: "GF" },
    { label: "Tally Prime", cat: "Finance", icon: "TP" },
    { label: "Node-RED", cat: "Automation", icon: "NR" },
    { label: "MQTT Broker", cat: "Protocol", icon: "MQ" },
    { label: "Google Cloud IoT", cat: "Cloud", icon: "GC" },
];
const INT_ROW2 = [
    { label: "PLC Interface", cat: "Hardware", icon: "PL" },
    { label: "Slack Alerts", cat: "Notify", icon: "SL" },
    { label: "InfluxDB", cat: "Database", icon: "IF" },
    { label: "Azure IoT Hub", cat: "Cloud", icon: "AZ" },
    { label: "Webhook Push", cat: "Automation", icon: "WH" },
    { label: "Email SMTP", cat: "Notify", icon: "EM" },
    { label: "REST API", cat: "Dev", icon: "RA" },
    { label: "Prometheus", cat: "Monitoring", icon: "PR" },
    { label: "Zigbee Mesh", cat: "Hardware", icon: "ZB" },
    { label: "Zoho Books", cat: "Finance", icon: "ZH" },
];
const CAT_CLR = {
    Finance: "#818cf8", Cloud: "#34d399", Control: "#f59e0b",
    Protocol: "#60a5fa", Analytics: "#a78bfa", Automation: "#fb923c",
    Hardware: "#f87171", Notify: "#facc15", Database: "#4ade80",
    Dev: "#38bdf8", Monitoring: "#c084fc",
};

function IntCard({ label, cat, icon }) {
    const col = CAT_CLR[cat] || "#818cf8";
    return (
        <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "14px", padding: "10px 18px",
            flexShrink: 0, marginRight: "12px",
        }}>
            <div style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                background: `${col}18`, border: `1px solid ${col}28`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 800, color: col,
                fontFamily: '"Plus Jakarta Sans",sans-serif',
            }}>{icon}</div>
            <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#f0f2fc", lineHeight: 1.2, fontFamily: '"Plus Jakarta Sans",sans-serif', whiteSpace: "nowrap" }}>{label}</div>
                <div style={{ fontSize: 10, color: col, fontWeight: 600, fontFamily: '"Plus Jakarta Sans",sans-serif', opacity: 0.8 }}>{cat}</div>
            </div>
        </div>
    );
}

function LiveSensorCard() {
    const [vals, setVals] = useState({ temp: 72.4, pressure: 48.1, vibration: 14.2, rpm: 1820, load: 67 });
    const [tick, setTick] = useState(0);
    const timeRef = useRef(new Date().toLocaleTimeString());

    useEffect(() => {
        const t = setInterval(() => {
            timeRef.current = new Date().toLocaleTimeString();
            setVals(v => ({
                temp: parseFloat(Math.max(20, Math.min(110, v.temp + (Math.random() - 0.48) * 1.5)).toFixed(1)),
                pressure: parseFloat(Math.max(0, Math.min(120, v.pressure + (Math.random() - 0.48) * 1.2)).toFixed(1)),
                vibration: parseFloat(Math.max(0, Math.min(40, v.vibration + (Math.random() - 0.5) * 0.8)).toFixed(1)),
                rpm: Math.max(800, Math.min(2900, Math.round(v.rpm + (Math.random() - 0.5) * 40))),
                load: Math.max(0, Math.min(100, Math.round(v.load + (Math.random() - 0.5) * 3))),
            }));
            setTick(x => x + 1);
        }, 1600);
        return () => clearInterval(t);
    }, []);

    const sensors = [
        { key: "temp", label: "Temperature", unit: "°C", warn: 80, crit: 95, max: 110 },
        { key: "pressure", label: "Pressure", unit: " bar", warn: 80, crit: 110, max: 120 },
        { key: "vibration", label: "Vibration", unit: " mm/s", warn: 20, crit: 35, max: 40 },
        { key: "rpm", label: "RPM", unit: "", warn: 2600, crit: 2900, max: 2900 },
        { key: "load", label: "Load", unit: "%", warn: 80, crit: 92, max: 100 },
    ];
    const col = (k) => {
        const s = sensors.find(x => x.key === k);
        const v = vals[k];
        if (!s) return "#22c55e";
        return v >= s.crit ? "#ef4444" : v >= s.warn ? "#f59e0b" : "#22c55e";
    };
    const allOk = sensors.every(s => vals[s.key] < s.warn);

    return (
        <div style={{
            background: "rgba(8,8,16,0.96)", border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 22, padding: "24px 28px", width: "100%", maxWidth: 380,
            boxShadow: "0 0 0 1px rgba(232,25,44,0.04), 0 32px 80px rgba(0,0,0,0.7)",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s ease-in-out infinite" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#f0f2fc", fontFamily: '"Plus Jakarta Sans",sans-serif', flex: 1 }}>
                    Industrial Boiler
                </span>
                <span style={{ fontSize: 10, color: "rgba(220,225,255,0.3)", fontFamily: "monospace" }}>{timeRef.current}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {sensors.map(s => {
                    const v = vals[s.key];
                    const c = col(s.key);
                    const pct = Math.min(100, (v / s.max) * 100);
                    return (
                        <div key={s.key}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                <span style={{ fontSize: 11, color: "rgba(220,225,255,0.4)", fontFamily: '"Plus Jakarta Sans",sans-serif', letterSpacing: "0.03em" }}>{s.label}</span>
                                <span style={{ fontSize: 12, fontWeight: 800, color: c, fontFamily: "monospace", transition: "color 0.5s" }}>{v}{s.unit}</span>
                            </div>
                            <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${pct}%`, background: c, borderRadius: 2, transition: "width 0.9s ease, background 0.5s", boxShadow: `0 0 6px ${c}55` }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: 18, padding: "10px 14px", background: allOk ? "rgba(34,197,94,0.06)" : "rgba(245,158,11,0.07)", border: `1px solid ${allOk ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.25)"}`, borderRadius: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={allOk ? "#22c55e" : "#f59e0b"} strokeWidth="2.5" strokeLinecap="round">
                    {allOk ? <polyline points="20 6 9 17 4 12" /> : <><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>}
                </svg>
                <span style={{ fontSize: 11, color: allOk ? "#22c55e" : "#f59e0b", fontWeight: 700, fontFamily: '"Plus Jakarta Sans",sans-serif', flex: 1 }}>
                    {allOk ? "All Sensors Normal" : "Watch threshold"}
                </span>
                <span style={{ fontSize: 10, color: "rgba(220,225,255,0.25)", fontFamily: "monospace" }}>tick {tick}</span>
            </div>
        </div>
    );
}

function IntegrationsSection() {
    return (
        <section style={{ padding: "100px 0", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "relative" }}>
            {/* Center glow */}
            <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "radial-gradient(ellipse,rgba(99,102,241,0.06) 0%,transparent 70%)", pointerEvents: "none" }} />

            <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 52px", padding: "0 24px", position: "relative" }}>
                <p style={{ fontSize: "11px", color: "#e8192c", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>Ecosystem</p>
                <h2 style={{ fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, margin: "0 0 16px", color: "#f0f2fc" }}>
                    Connects with everything<br />your business already runs.
                </h2>
                <p style={{ fontSize: 15, color: "rgba(220,225,255,0.45)", lineHeight: 1.7, margin: 0 }}>
                    From legacy PLCs to modern cloud platforms — fsociety plugs into your stack without disruption.
                </p>
            </div>

            {/* Live sensor card */}
            <div style={{ display: "flex", justifyContent: "center", padding: "0 24px 52px", position: "relative" }}>
                <LiveSensorCard />
            </div>

            {/* Fade edge masks */}
            <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: "linear-gradient(to right,#060608 0%,transparent 15%,transparent 85%,#060608 100%)" }} />

                {/* Row 1 — left → right */}
                <div style={{ overflow: "hidden", marginBottom: 12 }}>
                    <div style={{ display: "flex", animation: "marquee 38s linear infinite", width: "max-content" }}>
                        {[...INT_ROW1, ...INT_ROW1].map((c, i) => <IntCard key={i} {...c} />)}
                    </div>
                </div>

                {/* Row 2 — right → left */}
                <div style={{ overflow: "hidden" }}>
                    <div style={{ display: "flex", animation: "marqueeRev 32s linear infinite", width: "max-content" }}>
                        {[...INT_ROW2, ...INT_ROW2].map((c, i) => <IntCard key={i} {...c} />)}
                    </div>
                </div>
            </div>
        </section>
    );
}

const footerTitle = { fontSize: "11px", fontWeight: 700, color: "rgba(220,225,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px", marginTop: 0 };
const h2Style = { fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, margin: "0 0 0", color: "#f0f2fc" };
const btnPrimary = { background: ACCENT, border: "none", borderRadius: "999px", padding: "12px 28px", fontSize: "14px", fontWeight: 800, color: "#ffffff", cursor: "pointer", fontFamily: '"Plus Jakarta Sans",sans-serif', boxShadow: "0 4px 20px rgba(232,25,44,0.35)", transition: "all 0.18s" };
const btnSecondary = { background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "999px", padding: "12px 28px", fontSize: "14px", fontWeight: 600, color: "rgba(220,225,255,0.7)", cursor: "pointer", fontFamily: '"Plus Jakarta Sans",sans-serif', transition: "all 0.18s" };

