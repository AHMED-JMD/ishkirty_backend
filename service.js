var Service = require("node-windows").Service;
var svc = new Service({
  name: "Oil Station",
  description: "Oil system windows application running nodejs and flutter.",
  script: "E:\\Projects\\ishkirty_backend\\server.js",
});

svc.on("install", function () {
  svc.start();
});

svc.install();
