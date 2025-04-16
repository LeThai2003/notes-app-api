const { getDashboardData } = require("../controllers/dashboard.controller");
const { authenticateToken } = require("../utilities");

const router = require("express").Router();

router.get("/", authenticateToken, getDashboardData);

module.exports = router;