const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const route = require("./routes/index.route");
const path = require("path");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors({ origin: "*" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
route(app);

module.exports = app;
