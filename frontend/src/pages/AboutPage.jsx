import PolicyLayout, { Section } from "../components/PolicyLayout";

export default function AboutPage() {
    return (
        <PolicyLayout title="About fsociety" badge="Who We Are">
            <Section heading="We Are fsociety">
                <p>fsociety is a financial automation and industrial IoT monitoring platform. We build tools that connect factory-floor machinery to real financial intelligence — giving operations teams and CFOs the same live picture, in real time.</p>
                <p style={{ marginTop: "12px" }}>We are a small, focused team. We prefer to stay anonymous — the work speaks for itself.</p>
            </Section>

            <Section heading="What We Build">
                <p>Our platform lets companies deploy sensors on their machines, monitor live telemetry (temperature, pressure, RPM, vibration, and more), and automatically surface the financial implications of what those sensors read. Downtime costs money. We make sure you see it before it happens.</p>
            </Section>

            <Section heading="Our Mission">
                <p>Zero surprises. Zero downtime. Total visibility. We believe every factory floor decision should be backed by real data — and that the gap between machinery and management should not exist.</p>
            </Section>

            <Section heading="Future Plans">
                <ul style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <li>AI-powered predictive maintenance scoring</li>
                    <li>Direct ERP and accounting software integrations</li>
                    <li>Mobile app for on-floor technicians</li>
                    <li>Carbon footprint tracking per machine</li>
                </ul>
            </Section>
        </PolicyLayout>
    );
}

