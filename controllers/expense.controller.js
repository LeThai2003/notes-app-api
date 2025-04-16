const Expense = require("../models/expense.model");
const Income = require("../models/income.model");
const xlsx = require("xlsx");


// add expense
module.exports.addExpense = async(req, res) => {
  const userId = req.user.user._id;
  try {
    const {icon, category, amount, date} = req.body;
    if(!category || !amount || !date)
    {
      return res.status(400).json("Các trường trên đều yêu cầu (trừ icon)");
    }
    const newExpense = new Expense({
      userId,
      icon,
      category,
      amount,
      date: new Date(date)
    });

    await newExpense.save();

    return res.status(200).json(newExpense);
  } catch (error) {
    res.status(500).json({message: "Server error"}); 
  }
}

// get all expense
module.exports.getAllExpense = async(req, res) => {
  const userId = req.user.user._id;
  try {
    const expenses = await Expense.find({userId}).sort({date: -1});
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({message: "Server error"}); 
  }
}

// delete expense
module.exports.deleteExpense = async(req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.status(200).json({message: "Xóa chi tiêu thành công"});
  } catch (error) {
    res.status(500).json({message: "Server error"}); 
  }
}

// download expense excel
module.exports.downloadExpenseExcel = async(req, res) => {
  const userId = req.user.user._id;
  try {
    const expenses = await Expense.find({userId}).sort({date: -1});

    const data = expenses.map((item) => ({
      Category: item.category,
      Amount: item.amount,
      Date: item.date
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Expense");
    xlsx.writeFile(wb, "expense_details.xlsx");
    res.download("expense_details.xlsx");
  } catch (error) {
    res.status(500).json({message: "Server error"}); 
  }
}