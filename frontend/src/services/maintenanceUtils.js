// ── Maintenance Prediction Utilities ─────────────────────────────────────────
// Experimental — scores are heuristic, not from real sensor ML models.

const WARN_CRIT = {
    temperature: [80, 95], pressure: [80, 110], gas: [5, 8],
    vibration: [20, 35], current: [30, 40], cpuTemp: [75, 95], load: [80, 95],
};

/**
 * Compute a maintenance severity score (0–100).
 * Higher = more urgent maintenance needed.
 */
export function computeMaintenanceScore({ status, runtimeHours = 0, sensorStatus = {}, stressCycles = 0 }) {
    // 1. Machine status baseline (0–40 pts)
    const statusPts = status === "Critical" ? 40 : status === "Warning" ? 20 : 0;

    // 2. Runtime wear (0–25 pts): every 50 runtime hours adds ~5 pts, capped at 25
    const runtimePts = Math.min(25, (runtimeHours / 50) * 5);

    // 3. Sensor health (0–20 pts): each critical sensor adds 7pts, each warning adds 3pts
    let sensorPts = 0;
    Object.values(sensorStatus).forEach(s => {
        if (s === "Critical") sensorPts += 7;
        else if (s === "Warning") sensorPts += 3;
    });
    sensorPts = Math.min(20, sensorPts);

    // 4. Stress cycles (0–15 pts): every 5 cycles adds 1 pt
    const stressPts = Math.min(15, stressCycles / 5);

    return Math.min(100, Math.round(statusPts + runtimePts + sensorPts + stressPts));
}

/**
 * Derive a severity label + colors from 0–100 score.
 */
export function scoreSeverity(score) {
    if (score >= 65) return { label: "High", color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: "▲" };
    if (score >= 35) return { label: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: "!" };
    return { label: "Low", color: "#22c55e", bg: "rgba(34,197,94,0.1)", icon: "✓" };
}

/**
 * Predict the next maintenance window given a score.
 * Returns a Date object.
 */
export function predictNextMaintenance(score) {
    // 0 score = 180 days away; 100 score = 3 days away
    const daysAway = Math.max(3, Math.round(180 - score * 1.77));
    const d = new Date();
    d.setDate(d.getDate() + daysAway);
    return { date: d, daysAway };
}

/**
 * Compute confidence level based on how many data points we have.
 */
export function getConfidence(dataPoints) {
    if (dataPoints >= 100) return { label: "High", color: "#22c55e" };
    if (dataPoints >= 30) return { label: "Medium", color: "#f59e0b" };
    return { label: "Low", color: "#94a3b8" };
}

/**
 * Run n synthetic "stress ticks" on sensor values and return the
 * resulting simulated sensors + how many stress threshold crossings occurred.
 */
export function simulateTicks(sensors, n = 100) {
    const CLAMPS = {
        temperature: [-10, 200], humidity: [0, 100], power: [0, 10],
        pressure: [0, 150], gas: [0, 10], vibration: [0, 50],
        current: [0, 50], voltage: [180, 260], fuel: [0, 100],
        rpm: [0, 3000], cpuTemp: [20, 120], load: [0, 100],
    };

    let s = { ...sensors };
    let crossings = 0;

    for (let i = 0; i < n; i++) {
        const next = { ...s };
        Object.keys(s).forEach(k => {
            // Each tick: random walk with slight upward pressure (simulating wear)
            const drift = (Math.random() - 0.4) * 3; // slightly biased positive
            const [mn, mx] = CLAMPS[k] || [0, 9999];
            next[k] = Math.max(mn, Math.min(mx, (s[k] || 0) + drift));

            // Count threshold crossings
            if (WARN_CRIT[k]) {
                const [warn, crit] = WARN_CRIT[k];
                const prevBelow = (s[k] || 0) < warn;
                const nowAbove = next[k] >= warn;
                if (prevBelow && nowAbove) crossings++;
            }
        });
        s = next;
    }

    return { sensors: s, crossings };
}
