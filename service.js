var Service = require("node-windows").Service;
var svc = new Service({
  name: "Ishkirti Food",
  description: "Food managmend system for ishkirty resturant.",
  script: "E:\\Projects\\ishkirty_backend\\server.js",
});

svc.on("install", function () {
  svc.start();
});

svc.install();
