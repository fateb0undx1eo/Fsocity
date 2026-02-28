import PolicyLayout, { Section } from "../components/PolicyLayout";

export default function CookiePolicy() {
    return (
        <PolicyLayout title="Cookie Policy" badge="Legal">
            <Section heading="What Are Cookies">
                <p>Cookies are small text files placed on your device when you visit a website. They help the site remember your preferences and understand how you use the service. We use minimal, essential cookies only.</p>
            </Section>

            <Section heading="Cookies We Use">
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {[
                        { name: "Session Cookie", type: "Essential", desc: "Keeps you logged in while you navigate the dashboard. Expires when you close the browser or log out." },
                        { name: "Auth Token", type: "Essential", desc: "Stores your authentication session so you stay logged in across page reloads. Stored in localStorage, not sent to third parties." },
                        { name: "Theme Preference", type: "Functional", desc: "Remembers your light/dark mode preference." },
                        { name: "Analytics (future)", type: "Optional", desc: "We may introduce anonymous usage analytics in the future. You will be informed and given opt-out controls before this is activated." },
                    ].map(c => (
                        <div key={c.name} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                                <span style={{ fontWeight: 700, fontSize: "14px", color: "#f0f2fc" }}>{c.name}</span>
                                <span style={{ fontSize: "11px", fontWeight: 700, color: c.type === "Essential" ? "#e8192c" : "rgba(220,225,255,0.4)", background: c.type === "Essential" ? "rgba(232,25,44,0.1)" : "rgba(255,255,255,0.05)", border: c.type === "Essential" ? "1px solid rgba(232,25,44,0.25)" : "1px solid rgba(255,255,255,0.1)", borderRadius: "999px", padding: "2px 10px", letterSpacing: "0.05em", textTransform: "uppercase" }}>{c.type}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: "13px", color: "rgba(220,225,255,0.5)", lineHeight: 1.75 }}>{c.desc}</p>
                        </div>
                    ))}
                </div>
            </Section>

            <Section heading="Third-Party Cookies">
                <p>We do not currently use any third-party tracking or advertising cookies. We do not integrate with Google Analytics, Meta Pixel, or similar services.</p>
            </Section>

            <Section heading="Managing Cookies">
                <p>You can clear cookies and localStorage data through your browser settings at any time. Note that clearing your auth token will log you out of the dashboard. Essential cookies cannot be disabled without affecting core functionality.</p>
            </Section>

            <Section heading="Contact">
                <p>Questions about cookies? Email us at <a href="mailto:explainersenpai@gmail.com" style={{ color: "#e8192c", textDecoration: "none" }}>explainersenpai@gmail.com</a>.</p>
            </Section>
        </PolicyLayout>
    );
}
