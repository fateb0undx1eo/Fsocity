require("dotenv").config();

// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const crypto = require("crypto");   // built-in — no npm install needed
const fs = require("fs");
const path = require("path");

const { updateMachines } = require("./simulator");
const { sendAlertEmail } = require("./emailService");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ── Users DB (JSON file) ─────────────────────────────────────────────────────
const DB_PATH = path.join(__dirname, "users.json");

function readUsers() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, "utf8")); }
  catch { return []; }
}

function writeUsers(users) {
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}

// PBKDF2 password hashing (built-in Node.js crypto)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const attempt = crypto.pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  return attempt === hash;
}

function initials(name) {
  return name.trim().split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);
}

// ── Auth routes ──────────────────────────────────────────────────────────────

// POST /api/signup
app.post("/api/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields required." });

  const users = readUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
    return res.status(409).json({ error: "Email already registered. Please log in." });

  const user = { id: Date.now().toString(), name, email, password: hashPassword(password) };
  users.push(user);
  writeUsers(users);

  const session = { id: user.id, name, email, initials: initials(name) };
  res.json({ ok: true, user: session });
});

// POST /api/login  (auto-registers on first use)
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required." });

  const users = readUsers();
  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // First-time auto-register
    const name = email.split("@")[0]
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
    user = { id: Date.now().toString(), name, email, password: hashPassword(password) };
    users.push(user);
    writeUsers(users);
    const session = { id: user.id, name, email, initials: initials(name) };
    return res.json({ ok: true, user: session, created: true });
  }

  if (!verifyPassword(password, user.password))
    return res.status(401).json({ error: "Incorrect password." });

  const session = { id: user.id, name: user.name, email, initials: initials(user.name) };
  res.json({ ok: true, user: session });
});

// ── Alert email endpoint ─────────────────────────────────────────────────────
// POST /api/send-alert
app.post("/api/send-alert", async (req, res) => {
  const { toEmail, machineName, machineId, sensor, value, limit, condition, unit } = req.body;
  if (!toEmail || !machineId || !sensor) {
    return res.status(400).json({ error: "Missing required fields: toEmail, machineId, sensor" });
  }
  const result = await sendAlertEmail({ toEmail, machineName, machineId, sensor, value, limit, condition, unit });
  return res.json(result);
});

// ── Admin helpers ─────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin@fsociety2025";
const START_TIME = Date.now();
let broadcastMessage = null; // { text, sentAt }

function adminAuth(req, res) {
  const provided = req.headers["x-admin-password"];
  if (!provided || provided !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

// GET  /api/admin/data  — users + live machines + broadcast + uptime
app.get("/api/admin/data", (req, res) => {
  if (!adminAuth(req, res)) return;
  const users = readUsers().map(u => ({ id: u.id, name: u.name, email: u.email }));
  const { updateMachines: snap } = require("./simulator");
  const machines = Object.values(snap());
  res.json({
    users,
    machines,
    broadcast: broadcastMessage,
    uptimeSeconds: Math.floor((Date.now() - START_TIME) / 1000),
    generatedAt: new Date().toISOString(),
  });
});

// DELETE /api/admin/user/:id  — remove a user account
app.delete("/api/admin/user/:id", (req, res) => {
  if (!adminAuth(req, res)) return;
  const users = readUsers();
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });
  const [removed] = users.splice(idx, 1);
  writeUsers(users);
  res.json({ ok: true, removed: { id: removed.id, name: removed.name, email: removed.email } });
});

// POST /api/admin/broadcast  — set or clear the system-wide broadcast banner
app.post("/api/admin/broadcast", (req, res) => {
  if (!adminAuth(req, res)) return;
  const { text } = req.body;
  broadcastMessage = text ? { text, sentAt: new Date().toISOString() } : null;
  res.json({ ok: true, broadcast: broadcastMessage });
});



// ── Sensor broadcast ─────────────────────────────────────────────────────────
setInterval(() => {
  io.emit("machines", updateMachines());
}, 2000);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

app.get("/", (req, res) => res.send("Telemetry Backend Running"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));