// simulator.js — Industrial machine simulator with sensor thresholds

function rand(min, max) { return Math.random() * (max - min) + min; }
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

// ── Sensor thresholds (warn, critical) ──────────────────────────────────────
const THRESHOLDS = {
  temperature: { warn: 80, crit: 95 },
  pressure: { warn: 80, crit: 110 },
  gas: { warn: 5, crit: 8 },
  vibration: { warn: 20, crit: 35 },
  current: { warn: 30, crit: 40 },
  cpuTemp: { warn: 75, crit: 95 },
  load: { warn: 75, crit: 90 },
  humidity: { warn: 85, crit: 95 },  // high humidity = risk
  fuel: { warn: 25, crit: 10 },  // LOW fuel = warning (inverted)
  rpm: { warn: 2600, crit: 2900 }, // over-rev
  power: { warn: 8, crit: 9.5 },  // near max load
  voltage: { warn: 245, crit: 255 },  // over-voltage
};

// Compute status — handles both normal (high = bad) and inverted (low = bad) sensors
function getSensorStatus(key, value) {
  const th = THRESHOLDS[key];
  if (!th) return "Normal";

  // Inverted sensors: low value = danger
  if (key === "fuel") {
    if (value <= th.crit) return "Critical";
    if (value <= th.warn) return "Warning";
    return "Normal";
  }

  // Normal sensors: high value = danger
  if (value >= th.crit) return "Critical";
  if (value >= th.warn) return "Warning";
  return "Normal";
}

// ── Machine definitions ──────────────────────────────────────────────────────
const machines = {
  1: { id: 1, name: "Cold Storage Unit", sensors: { temperature: 4, humidity: 60, power: 2.1 } },
  2: { id: 2, name: "Industrial Boiler", sensors: { temperature: 120, pressure: 55, gas: 2 } },
  3: { id: 3, name: "Conveyor Motor", sensors: { vibration: 12, current: 18, voltage: 220 } },
  4: { id: 4, name: "Backup Generator", sensors: { fuel: 70, rpm: 1500, temperature: 85 } },
  5: { id: 5, name: "Server Rack", sensors: { cpuTemp: 55, load: 40, voltage: 230 } },
};

// ── Clamp ranges ──────────────────────────────────────────────────────────────
const CLAMPS = {
  temperature: [-10, 200], humidity: [0, 100], power: [0, 10],
  pressure: [0, 150], gas: [0, 10], vibration: [0, 50],
  current: [0, 50], voltage: [180, 260], fuel: [0, 100],
  rpm: [0, 3000], cpuTemp: [20, 120], load: [0, 100],
};

// ── Update loop ──────────────────────────────────────────────────────────────
function updateMachines() {
  Object.values(machines).forEach(m => {
    const s = m.sensors;

    // Random walk all sensors
    for (const key in s) {
      s[key] += rand(-2, 2);
      const c = CLAMPS[key];
      if (c) s[key] = clamp(s[key], c[0], c[1]);
    }

    // Compute per-sensor status using threshold table
    m.sensorStatus = {};
    for (const key in s) {
      m.sensorStatus[key] = getSensorStatus(key, s[key]);
    }

    // Overall machine status = worst of all sensor statuses
    const statuses = Object.values(m.sensorStatus);
    m.status = statuses.includes("Critical") ? "Critical"
      : statuses.includes("Warning") ? "Warning"
        : "Normal";

    m.lastUpdated = new Date();

    // Emit threshold values alongside so frontend can display them
    m.thresholds = THRESHOLDS;
  });

  return machines;
}

module.exports = { updateMachines, THRESHOLDS };