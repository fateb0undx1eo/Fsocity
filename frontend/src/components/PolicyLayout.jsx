import StarField from "./StarField";
import PublicNav from "./PublicNav";

export default function PolicyLayout({ title, badge, children }) {
    const ACCENT = "#e8192c";

    return (
        <div style={{ minHeight: "100vh", background: "#060608", color: "#f0f2fc", fontFamily: '"Plus Jakarta Sans",sans-serif', position: "relative" }}>
            <StarField />
            <PublicNav alwaysFilled />

            {/* Content */}
            <div style={{ maxWidth: "760px", margin: "0 auto", padding: "110px 32px 80px", position: "relative", zIndex: 1 }}>
                {badge && (
                    <span style={{ display: "inline-block", fontSize: "11px", fontWeight: 700, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
                        {badge}
                    </span>
                )}
                <h1 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, margin: "0 0 12px", color: "#f0f2fc" }}>
                    {title}
                </h1>
                <p style={{ fontSize: "13px", color: "rgba(220,225,255,0.3)", marginBottom: "48px", marginTop: 0 }}>
                    Last updated: February 2026
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export function Section({ heading, children }) {
    return (
        <div>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#f0f2fc", margin: "0 0 10px", letterSpacing: "-0.02em" }}>{heading}</h2>
            <div style={{ fontSize: "14px", color: "rgba(220,225,255,0.55)", lineHeight: 1.85 }}>{children}</div>
        </div>
    );
}
