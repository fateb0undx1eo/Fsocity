import PolicyLayout, { Section } from "../components/PolicyLayout";

export default function PrivacyPolicy() {
    return (
        <PolicyLayout title="Privacy Policy" badge="Legal">
            <Section heading="Overview">
                <p>fsociety ("we", "us", "our") operates an industrial IoT and financial automation platform. This Privacy Policy explains how we collect, use, and protect information when you use our services. By using fsociety, you agree to the practices described here.</p>
            </Section>

            <Section heading="Information We Collect">
                <ul style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <li><strong style={{ color: "#f0f2fc" }}>Account data</strong> — your name and email address when you register.</li>
                    <li><strong style={{ color: "#f0f2fc" }}>Sensor telemetry</strong> — machine data (temperature, pressure, RPM, vibration etc.) streamed from your hardware.</li>
                    <li><strong style={{ color: "#f0f2fc" }}>Usage data</strong> — pages visited, features used, session duration. Used to improve the platform.</li>
                    <li><strong style={{ color: "#f0f2fc" }}>Technical data</strong> — IP address, browser type, device identifiers for security purposes.</li>
                </ul>
            </Section>

            <Section heading="How We Use Your Data">
                <ul style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <li>Provide and operate the fsociety platform.</li>
                    <li>Send critical alerts and notifications from your sensors.</li>
                    <li>Improve features and fix bugs.</li>
                    <li>Communicate important service updates.</li>
                </ul>
                <p style={{ marginTop: "12px" }}>We do not sell your data to third parties. Ever.</p>
            </Section>

            <Section heading="Data Storage & Security">
                <p>Your sensor data and account information are stored on secured servers. We use encrypted connections (HTTPS/TLS) for all data in transit. Passwords are stored as salted hashes — plaintext passwords are never stored or accessible to us.</p>
            </Section>

            <Section heading="Data Retention">
                <p>We retain sensor history according to your plan tier (7 days, 30 days, or unlimited). Account data is retained for as long as your account is active. You may request deletion at any time by contacting us.</p>
            </Section>

            <Section heading="Your Rights">
                <p>You have the right to access, correct, or delete your personal data. To exercise these rights, email us at <a href="mailto:explainersenpai@gmail.com" style={{ color: "#e8192c", textDecoration: "none" }}>explainersenpai@gmail.com</a>.</p>
            </Section>

            <Section heading="Changes to This Policy">
                <p>We may update this policy periodically. We will notify registered users of material changes via email.</p>
            </Section>

            <Section heading="Contact">
                <p>Questions? Reach us at <a href="mailto:explainersenpai@gmail.com" style={{ color: "#e8192c", textDecoration: "none" }}>explainersenpai@gmail.com</a>.</p>
            </Section>
        </PolicyLayout>
    );
}
