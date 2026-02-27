// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const { updateMachines } = require("./simulator");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// ----- SOCKET CONNECTION -----
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // send data every 2 seconds
  const interval = setInterval(() => {
    const data = updateMachines();
    socket.emit("telemetry", data);
  }, 2000);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    clearInterval(interval);
  });
});

// simple test route
app.get("/", (req, res) => {
  res.send("Telemetry Backend Running");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
