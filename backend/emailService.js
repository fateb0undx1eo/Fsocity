// emailService.js — Nodemailer alert sender with per-sensor anti-spam cooldown
const nodemailer = require("nodemailer");

// ── Anti-spam cooldown store ──────────────────────────────────────────────────
// key: `${machineId}:${sensorKey}` → timestamp of last sent email
const lastSent = {};

// Cooldown: 10 minutes between emails for the same machine+sensor
const COOLDOWN_MS = 10 * 60 * 1000;

// ── Transporter ───────────────────────────────────────────────────────────────
// Uses environment variables for credentials.
// For testing: set EMAIL_USER and EMAIL_PASS in your shell, or create a .env file
// and use a library like dotenv to load it. Gmail "App Password" is recommended.
function createTransporter() {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER || "",
            pass: process.env.EMAIL_PASS || "",
        },
    });
}

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * Try to send an alert email. Returns { sent: true } or { sent: false, reason }.
 *
 * @param {Object} opts
 * @param {string} opts.toEmail       - Recipient email address
 * @param {string} opts.machineName   - Human-readable machine name
 * @param {string} opts.machineId     - Machine ID (used for cooldown key)
 * @param {string} opts.sensor        - Sensor key (e.g. "temperature")
 * @param {number} opts.value         - Current sensor reading
 * @param {number} opts.limit         - User-defined threshold
 * @param {string} opts.condition     - "Warning" | "Critical"
 * @param {string} opts.unit          - Sensor unit string (e.g. "°C")
 */
async function sendAlertEmail({ toEmail, machineName, machineId, sensor, value, limit, condition, unit = "" }) {
    if (!toEmail) return { sent: false, reason: "No recipient email" };
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return { sent: false, reason: "EMAIL_USER / EMAIL_PASS env vars not set" };
    }

    // ── Anti-spam check ────────────────────────────────────────────────────────
    const key = `${machineId}:${sensor}`;
    const now = Date.now();
    if (lastSent[key] && now - lastSent[key] < COOLDOWN_MS) {
        const remaining = Math.ceil((COOLDOWN_MS - (now - lastSent[key])) / 60000);
        return { sent: false, reason: `Cooldown active — ${remaining}m remaining` };
    }

    const condColor = condition === "Critical" ? "#ef4444" : "#f59e0b";
    const condBg = condition === "Critical" ? "#fee2e2" : "#fef3c7";
    const sensorLabel = sensor === "cpuTemp" ? "CPU Temp" : sensor.charAt(0).toUpperCase() + sensor.slice(1);
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#0f0f13;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:32px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#18181f;border-radius:16px;overflow:hidden;border:1px solid #2a2a35;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e1b4b,#312e81);padding:24px 32px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:10px;height:10px;border-radius:50%;background:${condColor};box-shadow:0 0 8px ${condColor};display:inline-block;margin-right:8px;"></div>
              <span style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.03em;">IoT Dashboard Alert</span>
            </div>
            <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:6px 0 0;">Automated sensor threshold notification</p>
          </td>
        </tr>
        <!-- Condition badge -->
        <tr>
          <td style="padding:24px 32px 0;">
            <span style="display:inline-block;background:${condBg};color:${condColor};font-size:11px;font-weight:800;padding:4px 14px;border-radius:999px;letter-spacing:0.08em;text-transform:uppercase;">${condition}</span>
          </td>
        </tr>
        <!-- Machine / sensor info -->
        <tr>
          <td style="padding:16px 32px 24px;">
            <h2 style="font-size:22px;font-weight:800;color:#f1f5f9;margin:0 0 4px;">${machineName}</h2>
            <p style="color:#94a3b8;font-size:13px;margin:0 0 20px;">Machine ID: ${machineId}</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #2a2a35;">
              <tr style="background:#1e1e28;">
                <td style="padding:12px 16px;font-size:11px;color:#64748b;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;width:50%;">Sensor</td>
                <td style="padding:12px 16px;font-size:11px;color:#64748b;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;">Value → Limit</td>
              </tr>
              <tr style="background:#18181f;">
                <td style="padding:14px 16px;color:#e2e8f0;font-size:15px;font-weight:700;">${sensorLabel}</td>
                <td style="padding:14px 16px;font-size:15px;font-weight:800;color:${condColor};">
                  ${value.toFixed(1)}${unit} <span style="color:#475569;font-weight:400;">→</span> <span style="color:#94a3b8;">${limit}${unit}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Timestamp -->
        <tr>
          <td style="padding:0 32px 24px;">
            <p style="color:#475569;font-size:11px;margin:0;">Detected at ${timestamp} (IST)</p>
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 28px;">
            <a href="http://localhost:5173/machine/${machineId}" style="display:inline-block;background:#4f46e5;color:#fff;font-size:13px;font-weight:700;padding:11px 24px;border-radius:999px;text-decoration:none;">View Machine Dashboard →</a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#111118;padding:16px 32px;border-top:1px solid #2a2a35;">
            <p style="color:#374151;font-size:11px;margin:0;">You receive these alerts because you set a threshold for <strong style="color:#6b7280;">${sensorLabel}</strong> on this machine.
            Emails are rate-limited to once per 10 minutes per sensor to avoid spam.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    try {
        const transporter = createTransporter();
        await transporter.sendMail({
            from: `"IoT Dashboard Alerts" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: `🚨 ${condition}: ${sensorLabel} on ${machineName} — ${value.toFixed(1)}${unit}`,
            html,
        });

        // Record send time for cooldown
        lastSent[key] = Date.now();
        return { sent: true };
    } catch (err) {
        console.error("[emailService] Failed to send:", err.message);
        return { sent: false, reason: err.message };
    }
}

module.exports = { sendAlertEmail };
