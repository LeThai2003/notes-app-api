const express = require("express");
const route = express.Router();
const controller = require("../controllers/user.controller");
const { authenticateToken } = require("../utilities");


route.post("/create-account", controller.createAccountPost);

route.post("/login", controller.loginPost);

route.get("/get-info", authenticateToken, controller.getInfoUser);

module.exports = route;