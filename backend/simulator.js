// simulator.js
// Simulates 5 industrial machines with different sensors

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// ----- SENSOR STATUS LOGIC -----
function getStatus(value, warn, crit) {
  if (value >= crit) return "Critical";
  if (value >= warn) return "Warning";
  return "Normal";
}

// ----- MACHINE DEFINITIONS -----
const machines = {
  1: {
    id: 1,
    name: "Cold Storage Unit",
    sensors: { temperature: 4, humidity: 60, power: 2.1 }
  },
  2: {
    id: 2,
    name: "Industrial Boiler",
    sensors: { temperature: 120, pressure: 55, gas: 2 }
  },
  3: {
    id: 3,
    name: "Conveyor Motor",
    sensors: { vibration: 12, current: 18, voltage: 220 }
  },
  4: {
    id: 4,
    name: "Backup Generator",
    sensors: { fuel: 70, rpm: 1500, temperature: 85 }
  },
  5: {
    id: 5,
    name: "Server Rack",
    sensors: { cpuTemp: 55, load: 40, voltage: 230 }
  }
};

// ----- UPDATE LOGIC -----
function updateMachines() {
  Object.values(machines).forEach(m => {
    const s = m.sensors;

    for (let key in s) {
      s[key] += rand(-2, 2);
    }

    // clamp realistic ranges
    if (s.temperature !== undefined) s.temperature = clamp(s.temperature, -10, 200);
    if (s.humidity !== undefined) s.humidity = clamp(s.humidity, 0, 100);
    if (s.power !== undefined) s.power = clamp(s.power, 0, 10);
    if (s.pressure !== undefined) s.pressure = clamp(s.pressure, 0, 150);
    if (s.gas !== undefined) s.gas = clamp(s.gas, 0, 10);
    if (s.vibration !== undefined) s.vibration = clamp(s.vibration, 0, 50);
    if (s.current !== undefined) s.current = clamp(s.current, 0, 50);
    if (s.voltage !== undefined) s.voltage = clamp(s.voltage, 180, 260);
    if (s.fuel !== undefined) s.fuel = clamp(s.fuel, 0, 100);
    if (s.rpm !== undefined) s.rpm = clamp(s.rpm, 0, 3000);
    if (s.cpuTemp !== undefined) s.cpuTemp = clamp(s.cpuTemp, 20, 120);
    if (s.load !== undefined) s.load = clamp(s.load, 0, 100);

    // sensor-level status
    m.sensorStatus = {};

    if (s.temperature !== undefined)
      m.sensorStatus.temperature = getStatus(s.temperature, 80, 95);

    if (s.pressure !== undefined)
      m.sensorStatus.pressure = getStatus(s.pressure, 80, 110);

    if (s.gas !== undefined)
      m.sensorStatus.gas = getStatus(s.gas, 5, 8);

    if (s.vibration !== undefined)
      m.sensorStatus.vibration = getStatus(s.vibration, 20, 35);

    if (s.current !== undefined)
      m.sensorStatus.current = getStatus(s.current, 30, 40);

    if (s.cpuTemp !== undefined)
      m.sensorStatus.cpuTemp = getStatus(s.cpuTemp, 75, 95);

    if (s.load !== undefined)
      m.sensorStatus.load = getStatus(s.load, 80, 95);

    // overall machine status
    m.status = Object.values(m.sensorStatus).includes("Critical")
      ? "Critical"
      : Object.values(m.sensorStatus).includes("Warning")
      ? "Warning"
      : "Normal";

    m.lastUpdated = new Date();
  });

  return machines;
}

module.exports = { updateMachines };