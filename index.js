const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const router = require("./routes");

//middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

//setting up routes
app.use("/api", router);

module.exports = app;
