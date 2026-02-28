import PolicyLayout, { Section } from "../components/PolicyLayout";

export default function TermsOfService() {
    return (
        <PolicyLayout title="Terms of Service" badge="Legal">
            <Section heading="Acceptance of Terms">
                <p>By accessing or using the fsociety platform, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.</p>
            </Section>

            <Section heading="Service Description">
                <p>fsociety provides a real-time industrial IoT monitoring and financial automation platform. The service is currently in closed beta. Features, pricing, and availability may change without notice during the beta period.</p>
            </Section>

            <Section heading="Beta Disclaimer">
                <p>fsociety is currently in a <strong style={{ color: "#e8192c" }}>closed beta</strong>. The platform is provided as-is during this period. We make no guarantees of uptime, data preservation, or feature continuity during beta. Beta access may be revoked at any time.</p>
            </Section>

            <Section heading="User Responsibilities">
                <ul style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <li>You are responsible for maintaining the security of your account credentials.</li>
                    <li>You must not use the platform for unlawful purposes.</li>
                    <li>You must not attempt to reverse-engineer, scrape, or exploit the platform.</li>
                    <li>Sensor data you upload remains your property. You grant us a limited licence to process it to provide the service.</li>
                </ul>
            </Section>

            <Section heading="Payment & Billing">
                <p>Paid plans will be invoiced in INR + GST. Prices displayed on our pricing page may change. You will receive notice before any price change affects your active subscription. A 14-day free trial is available on all plans — no credit card required to start.</p>
            </Section>

            <Section heading="Limitation of Liability">
                <p>fsociety shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability for any claim shall not exceed the amount you paid us in the 3 months preceding the claim.</p>
            </Section>

            <Section heading="Termination">
                <p>We reserve the right to suspend or terminate your account if you violate these terms. You may cancel your account at any time by contacting us.</p>
            </Section>

            <Section heading="Governing Law">
                <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of Indian courts.</p>
            </Section>

            <Section heading="Contact">
                <p>Questions about these terms? Email us at <a href="mailto:explainersenpai@gmail.com" style={{ color: "#e8192c", textDecoration: "none" }}>explainersenpai@gmail.com</a>.</p>
            </Section>
        </PolicyLayout>
    );
}
