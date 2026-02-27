// ================= MACHINE DATA =================
const machines = {
  "CNC Machine": {
    base: 20,
    idle: 5,
    load: 70,
    efficiency: 90,
    state: "ACTIVE"
  },
  "Conveyor Belt": {
    base: 15,
    idle: 4,
    load: 50,
    efficiency: 85,
    state: "ACTIVE"
  },
  "Air Compressor": {
    base: 18,
    idle: 6,
    load: 40,
    efficiency: 80,
    state: "ACTIVE"
  },
  "Industrial Furnace": {
    base: 25,
    idle: 8,
    load: 85,
    efficiency: 75,
    state: "ACTIVE"
  },
  "Packaging Unit": {
    base: 10,
    idle: 3,
    load: 30,
    efficiency: 95,
    state: "ACTIVE"
  }
};

let interval;
let currentMachine = null;

// ================= OPEN MACHINE =================
function openMachine(name) {
  currentMachine = machines[name];

  document.getElementById("selectionScreen").classList.remove("active");
  document.getElementById("machineScreen").classList.add("active");

  document.getElementById("machineTitle").innerText = name;

  startSimulation();
}

// ================= GO BACK =================
function goBack() {
  clearInterval(interval);

  document.getElementById("machineScreen").classList.remove("active");
  document.getElementById("selectionScreen").classList.add("active");
}

// ================= SIMULATION =================
function startSimulation() {
  interval = setInterval(() => {

    // Load fluctuation
    currentMachine.load += (Math.random() * 6 - 3);
    currentMachine.load = Math.max(10, Math.min(100, currentMachine.load));

    // Efficiency slowly drops
    currentMachine.efficiency -= 0.05;
    if (currentMachine.efficiency < 50) {
      currentMachine.efficiency = 95; // auto reset for demo
    }

    // Energy formula
    const energy =
      currentMachine.base *
      (currentMachine.load / 100) *
      (currentMachine.efficiency / 100);

    // Condition detection
    let condition = "NORMAL";
    if (currentMachine.efficiency < 75) condition = "WARNING";
    if (currentMachine.efficiency < 60) condition = "CRITICAL";

    // Update UI
    document.getElementById("loadValue").innerText =
      currentMachine.load.toFixed(0) + "%";

    document.getElementById("effValue").innerText =
      currentMachine.efficiency.toFixed(1) + "%";

    document.getElementById("energyValue").innerText =
      energy.toFixed(1) + " kW";

    const conditionElement = document.getElementById("conditionValue");
    conditionElement.innerText = condition;

    // Color condition
    if (condition === "NORMAL") conditionElement.style.color = "#22c55e";
    if (condition === "WARNING") conditionElement.style.color = "#facc15";
    if (condition === "CRITICAL") conditionElement.style.color = "#ef4444";

  }, 1000);
}