const { addIncome, getAllIncome, downloadIncomeExcel, deleteIncome } = require("../controllers/income.controller");
const { authenticateToken } = require("../utilities");

const router = require("express").Router();

router.post("/add", authenticateToken, addIncome);

router.get("/get", authenticateToken, getAllIncome);

router.get("/download-excel", authenticateToken, downloadIncomeExcel);

router.delete("/:id", authenticateToken, deleteIncome);

module.exports = router;