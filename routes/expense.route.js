const { addExpense, getAllExpense, downloadExpenseExcel, deleteExpense } = require("../controllers/expense.controller");
const { authenticateToken } = require("../utilities");

const router = require("express").Router();

router.post("/add", authenticateToken, addExpense);

router.get("/get", authenticateToken, getAllExpense);

router.get("/download-excel", authenticateToken, downloadExpenseExcel);

router.delete("/:id", authenticateToken, deleteExpense);

module.exports = router;