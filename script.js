let temp = 65;
let vib = 2;

function updateStatus() {
  document.getElementById("temp").innerText = temp.toFixed(1) + "°C";

  if (temp < 50) {
    document.getElementById("status").innerText = "NORMAL";
    document.getElementById("status").style.color = "green";
  } 
  else if (temp < 70) {
    document.getElementById("status").innerText = "WARNING";
    document.getElementById("status").style.color = "orange";
  } 
  else {
    document.getElementById("status").innerText = "CRITICAL";
    document.getElementById("status").style.color = "red";
  }
}

function updateVibration() {
  document.getElementById("vib").innerText = vib.toFixed(1) + " mm/s";

  if (vib < 3) {
    document.getElementById("vibStatus").innerText = "NORMAL";
    document.getElementById("vibStatus").style.color = "green";
  } 
  else if (vib < 6) {
    document.getElementById("vibStatus").innerText = "WARNING";
    document.getElementById("vibStatus").style.color = "orange";
  } 
  else {
    document.getElementById("vibStatus").innerText = "CRITICAL";
    document.getElementById("vibStatus").style.color = "red";
  }
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function simulateMachine() {
  temp += randomBetween(-2, 3);
  temp = Math.max(30, Math.min(100, temp));

  vib += randomBetween(-0.3, 0.5);
  vib = Math.max(0.5, Math.min(8, vib));

  updateStatus();
  updateVibration();
}

function increaseTemp() {
  temp += 10;
  updateStatus();
}

function resetTemp() {
  temp = 45;
  updateStatus();
}

updateStatus();
updateVibration();

setInterval(simulateMachine, 1000);