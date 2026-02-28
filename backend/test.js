const { updateMachines } = require("./simulator");

setInterval(() => {
  const data = updateMachines();
  console.log(JSON.stringify(data, null, 2));
}, 2000);