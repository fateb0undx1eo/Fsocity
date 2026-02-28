// pdfExport.js — Zero-dependency machine report PDF
// Opens a styled HTML page in a new window and triggers browser Save-as-PDF

const SENSOR_UNITS = {
    temperature: "°C", humidity: "%", power: "kW", pressure: "bar",
    gas: "ppm", vibration: "mm/s", current: "A", voltage: "V",
    fuel: "%", rpm: " RPM", cpuTemp: "°C", load: "%",
};

const WARN_CRIT = {
    temperature: [80, 95], pressure: [80, 110], gas: [5, 8],
    vibration: [20, 35], current: [30, 40], cpuTemp: [75, 95], load: [80, 95],
};

const SENSOR_RANGES = {
    temperature: [0, 200], humidity: [0, 100], power: [0, 10], pressure: [0, 150],
    gas: [0, 10], vibration: [0, 50], current: [0, 50], voltage: [180, 260],
    fuel: [0, 100], rpm: [0, 3000], cpuTemp: [20, 120], load: [0, 100],
};

const SENSOR_COLORS = [
    "#818cf8", "#34d399", "#fbbf24", "#f87171", "#60a5fa",
    "#fb923c", "#f472b6", "#a78bfa", "#4ade80", "#38bdf8",
];

function label(k) { return k === "cpuTemp" ? "CPU Temp" : k.charAt(0).toUpperCase() + k.slice(1); }
function unit(k) { return SENSOR_UNITS[k] || ""; }

function sStatus(k, v) {
    if (!WARN_CRIT[k]) return "Normal";
    const [w, cr] = WARN_CRIT[k];
    return v >= cr ? "Critical" : v >= w ? "Warning" : "Normal";
}

function effPct(k, v) {
    const [mn, mx] = SENSOR_RANGES[k] ?? [0, 100];
    return Math.max(0, Math.min(100, ((v - mn) / (mx - mn)) * 100));
}

function fmtRuntime(h) {
    if (!h || h < 0.017) return "0m";
    const hh = Math.floor(h), m = Math.floor((h - hh) * 60);
    return hh > 0 ? `${hh}h ${m}m` : `${m}m`;
}

function statusColor(s) {
    if (s === "Critical") return "#ef4444";
    if (s === "Warning") return "#f59e0b";
    return "#22c55e";
}

function pillStyle(s) {
    const map = {
        Critical: "background:#fecaca;color:#7f1d1d",
        Warning: "background:#fef08a;color:#713f12",
        Normal: "background:#bbf7d0;color:#14532d",
    };
    return map[s] || map.Normal;
}

export function generateMachinePDF({
    machineName, machineId, status, opStatus, runtimeHours,
    sensors = {}, sensorStatus: ss = {}, limits = {},
}) {
    const sKeys = Object.keys(sensors);
    const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const critCount = sKeys.filter(k => (ss[k] || sStatus(k, sensors[k])) === "Critical").length;
    const warnCount = sKeys.filter(k => (ss[k] || sStatus(k, sensors[k])) === "Warning").length;
    const normalCount = sKeys.length - critCount - warnCount;

    const effScores = sKeys.map(k => effPct(k, sensors[k]));
    const avgEff = effScores.length ? effScores.reduce((a, b) => a + b, 0) / effScores.length : 0;
    const health = Math.max(0, Math.min(100, 100 - critCount * 25 - warnCount * 10));

    const statusColor_ = status === "Critical" ? "#ef4444" : status === "Warning" ? "#f59e0b" : "#22c55e";
    const healthColor = health >= 80 ? "#22c55e" : health >= 50 ? "#f59e0b" : "#ef4444";

    // ── Sensor cards HTML ─────────────────────────────────────────────────────
    const sensorRows = sKeys.map((k, i) => {
        const v = sensors[k];
        const sv = ss[k] || sStatus(k, v);
        const eff = effPct(k, v);
        const col = SENSOR_COLORS[i % SENSOR_COLORS.length];
        const lim = limits[k];
        const valStr = typeof v === "number" ? v.toFixed(2) + unit(k) : String(v);

        return `
      <div class="sensor-card">
        <div class="sensor-bar" style="background:${col}"></div>
        <div class="sensor-body">
          <div class="sensor-name">${label(k)}</div>
          <div class="sensor-val" style="color:${statusColor(sv)}">${valStr}</div>
          <div class="progress-wrap">
            <div class="progress-bar" style="width:${eff.toFixed(1)}%;background:${col}"></div>
          </div>
          <div class="sensor-meta">
            <span>${eff.toFixed(1)}% load</span>
            <span style="${pillStyle(sv)};padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700">${sv}</span>
            ${lim !== undefined ? `<span style="color:#94a3b8">Limit: ${lim}${unit(k)}</span>` : ""}
          </div>
        </div>
      </div>`;
    }).join("");

    // ── Ranked table rows ─────────────────────────────────────────────────────
    const ranked = [...sKeys].sort((a, b) => effPct(b, sensors[b]) - effPct(a, sensors[a]));
    const tableRows = ranked.map((k, i) => {
        const v = sensors[k];
        const sv = ss[k] || sStatus(k, v);
        const eff = effPct(k, v);
        const lim = limits[k];
        const bg = i % 2 === 0 ? "#f8fafc" : "#fff";
        return `
      <tr style="background:${bg}">
        <td>${label(k)}</td>
        <td style="font-weight:700;color:${statusColor(sv)}">${typeof v === "number" ? v.toFixed(2) : v}</td>
        <td>${unit(k)}</td>
        <td style="color:${eff > 85 ? "#ef4444" : eff > 65 ? "#f59e0b" : "#22c55e"}">${eff.toFixed(1)}%</td>
        <td><span style="${pillStyle(sv)};padding:2px 9px;border-radius:999px;font-size:10px;font-weight:700">${sv}</span></td>
        <td style="color:#94a3b8">${lim !== undefined ? lim + unit(k) : "—"}</td>
      </tr>`;
    }).join("");

    // ── Recommendations ───────────────────────────────────────────────────────
    const recs = [];
    if (critCount > 0) recs.push({ col: "#ef4444", txt: `${critCount} sensor(s) in CRITICAL state — immediate attention required.` });
    if (warnCount > 0) recs.push({ col: "#f59e0b", txt: `${warnCount} sensor(s) at WARNING level — monitor and schedule maintenance.` });
    if (opStatus === "Idle") recs.push({ col: "#6366f1", txt: "Machine is idling — readings may not reflect peak-load conditions." });
    if (health >= 90) recs.push({ col: "#22c55e", txt: "All sensors nominal. System operating within expected parameters." });
    if (recs.length === 0) recs.push({ col: "#22c55e", txt: "No anomalies detected. Continue standard monitoring schedule." });

    const recHTML = recs.map(r =>
        `<div class="rec" style="border-left:3px solid ${r.col}"><span style="color:${r.col};font-weight:700">●</span> ${r.txt}</div>`
    ).join("");

    // ── Full HTML document ────────────────────────────────────────────────────
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${machineName} — Machine Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Roboto+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', sans-serif;
    background: #fff; color: #1e293b;
    font-size: 13px; line-height: 1.5;
  }

  /* ── Header ── */
  .header {
    background: #0d0d14;
    padding: 28px 36px 22px;
    border-left: 5px solid ${statusColor_};
    color: #f0f2fc;
  }
  .header h1 { font-size: 26px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 6px; }
  .header .sub { font-size: 11px; color: #64748b; margin-bottom: 14px; font-family: 'Roboto Mono', monospace; }
  .pills { display: flex; gap: 8px; flex-wrap: wrap; }
  .pill {
    padding: 3px 12px; border-radius: 999px; font-size: 11px;
    font-weight: 700; letter-spacing: 0.05em;
  }

  /* ── Content wrapper ── */
  .content { padding: 28px 36px; }

  /* ── Section label ── */
  .section-label {
    font-size: 10px; font-weight: 700; color: #94a3b8;
    letter-spacing: 0.1em; text-transform: uppercase;
    margin-bottom: 14px; margin-top: 24px;
    border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;
  }
  .section-label:first-of-type { margin-top: 0; }

  /* ── Summary boxes ── */
  .summary-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 4px; }
  .sum-box {
    border-radius: 12px; padding: 16px 18px;
    border: 1px solid #e2e8f0;
  }
  .sum-val  { font-size: 28px; font-weight: 800; line-height: 1; margin-bottom: 4px; }
  .sum-lbl  { font-size: 12px; font-weight: 700; color: #334155; }
  .sum-sub  { font-size: 11px; color: #64748b; margin-top: 2px; }

  /* ── Sensor cards ── */
  .sensor-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; }
  .sensor-card { display: flex; border-radius: 10px; border: 1px solid #e2e8f0; overflow: hidden; }
  .sensor-bar  { width: 4px; flex-shrink: 0; }
  .sensor-body { padding: 10px 12px; flex: 1; }
  .sensor-name { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
  .sensor-val  { font-size: 18px; font-weight: 800; margin-bottom: 6px; }
  .progress-wrap { height: 4px; background: #e2e8f0; border-radius: 999px; overflow: hidden; margin-bottom: 6px; }
  .progress-bar  { height: 100%; border-radius: 999px; }
  .sensor-meta   { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 11px; color: #64748b; }

  /* ── Efficiency boxes ── */
  .eff-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
  .eff-box  { border-radius: 10px; padding: 14px 16px; border: 2px solid; }
  .eff-val  { font-size: 24px; font-weight: 800; line-height: 1.1; }
  .eff-lbl  { font-size: 11px; font-weight: 700; color: #334155; margin-top: 4px; }
  .eff-sub  { font-size: 10px; color: #64748b; margin-top: 2px; }

  /* ── Table ── */
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  thead { background: #1e1b4b; color: #c7d2fe; }
  thead th { padding: 9px 12px; text-align: left; font-size: 11px; font-weight: 700; }
  tbody td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }

  /* ── Recommendations ── */
  .rec { padding: 10px 14px; margin-bottom: 8px; background: #f8fafc; border-radius: 8px; font-size: 13px; color: #334155; }

  /* ── Footer ── */
  .footer {
    background: #0d0d14; color: #475569; padding: 12px 36px;
    font-size: 11px; display: flex; justify-content: space-between;
    margin-top: 32px; font-family: 'Roboto Mono', monospace;
  }

  @media print {
    @page { margin: 0; size: A4 portrait; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .content { padding: 20px 28px; }
  }
</style>
</head>
<body>

<!-- Header -->
<div class="header">
  <h1>${machineName}</h1>
  <div class="sub">Machine ID: ${machineId} &nbsp;·&nbsp; Generated: ${now} IST</div>
  <div class="pills">
    <span class="pill" style="background:${statusColor_}22;color:${statusColor_}">${status.toUpperCase()}</span>
    <span class="pill" style="background:#1e1b4b;color:#818cf8">${(opStatus || "Active").toUpperCase()}</span>
    <span class="pill" style="background:#1e293b;color:#94a3b8">RUNTIME: ${fmtRuntime(runtimeHours)}</span>
  </div>
</div>

<!-- Content -->
<div class="content">

  <!-- Executive Summary -->
  <div class="section-label">Executive Summary</div>
  <div class="summary-grid">
    <div class="sum-box" style="background:#eef2ff">
      <div class="sum-val" style="color:#4f46e5">${sKeys.length}</div>
      <div class="sum-lbl">Total Sensors</div>
      <div class="sum-sub">being monitored</div>
    </div>
    <div class="sum-box" style="background:${critCount > 0 ? "#fef2f2" : warnCount > 0 ? "#fffbeb" : "#f0fdf4"}">
      <div class="sum-val" style="color:${critCount > 0 ? "#ef4444" : warnCount > 0 ? "#f59e0b" : "#22c55e"}">${critCount + warnCount}</div>
      <div class="sum-lbl">Anomalies</div>
      <div class="sum-sub">${critCount} critical · ${warnCount} warning</div>
    </div>
    <div class="sum-box" style="background:#f0fdf4">
      <div class="sum-val" style="color:#22c55e">${normalCount}</div>
      <div class="sum-lbl">Normal</div>
      <div class="sum-sub">sensors in range</div>
    </div>
  </div>

  <!-- Live Sensor Readings -->
  <div class="section-label">Live Sensor Readings</div>
  <div class="sensor-grid">${sensorRows}</div>

  <!-- Efficiency Analysis -->
  <div class="section-label">Efficiency Analysis</div>
  <div class="eff-grid">
    <div class="eff-box" style="border-color:#4f46e5;background:#eef2ff">
      <div class="eff-val" style="color:#4f46e5">${avgEff.toFixed(1)}%</div>
      <div class="eff-lbl">Avg Sensor Load</div>
      <div class="eff-sub">across all sensors</div>
    </div>
    <div class="eff-box" style="border-color:${healthColor};background:${healthColor}11">
      <div class="eff-val" style="color:${healthColor}">${health}/100</div>
      <div class="eff-lbl">Health Score</div>
      <div class="eff-sub">${health >= 90 ? "all systems nominal" : health >= 60 ? "monitor closely" : "needs attention"}</div>
    </div>
    <div class="eff-box" style="border-color:#0ea5e9;background:#e0f2fe">
      <div class="eff-val" style="color:#0ea5e9;font-family:'Roboto Mono',monospace">${fmtRuntime(runtimeHours)}</div>
      <div class="eff-lbl">Runtime</div>
      <div class="eff-sub">status: ${opStatus || "Active"}</div>
    </div>
  </div>

  <!-- Sensor Ranking Table -->
  <div class="section-label">Sensor Ranking (by current load %)</div>
  <table>
    <thead>
      <tr>
        <th>Sensor</th><th>Value</th><th>Unit</th>
        <th>Load %</th><th>Status</th><th>Limit</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>

  <!-- Recommendations -->
  <div class="section-label">Recommendations</div>
  ${recHTML}

</div>

<!-- Footer -->
<div class="footer">
  <span>IoT Dashboard — Machine Report — ${machineName}</span>
  <span>CONFIDENTIAL</span>
  <span>${now} IST</span>
</div>

<script>
  window.onafterprint = () => window.close();
  setTimeout(() => window.print(), 800);
</script>
</body>
</html>`;

    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) { alert("Please allow popups for this site to download the PDF."); return; }
    w.document.write(html);
    w.document.close();
}
