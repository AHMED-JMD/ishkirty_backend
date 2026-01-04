const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const router = require("./routes");

//middlewares
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "http://localhost:8080", // Allow all origins (for development)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
//static routes
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "client/build")));
app.use(express.json());

//setting up routes
app.use("/api", router);

//route the flutter index
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});

module.exports = app;
