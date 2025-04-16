const Income = require("../models/income.model");
const xlsx = require("xlsx");


// add income
module.exports.addIncome = async(req, res) => {
  const userId = req.user.user._id;
  try {
    const {icon, source, amount, date} = req.body;
    if(!source || !amount || !date)
    {
      return res.status(400).json("Các trường trên đều yêu cầu (trừ icon)");
    }
    const newIncome = new Income({
      userId,
      icon,
      source,
      amount,
      date: new Date(date)
    });

    await newIncome.save();

    return res.status(200).json(newIncome);
  } catch (error) {
    res.status(500).json({message: "Server error"}); 
  }
}

// get all income
module.exports.getAllIncome = async(req, res) => {
  const userId = req.user.user._id;
  try {
    const incomes = await Income.find({userId}).sort({date: -1});
    res.status(200).json(incomes);
  } catch (error) {
    res.status(500).json({message: "Server error"}); 
  }
}

// delete income
module.exports.deleteIncome = async(req, res) => {
  try {
    await Income.findByIdAndDelete(req.params.id);
    res.status(200).json({message: "Xóa khoản thu thành công"});
  } catch (error) {
    res.status(500).json({message: "Server error"}); 
  }
}

// download income excel
module.exports.downloadIncomeExcel = async(req, res) => {
  const userId = req.user.user._id;
  try {
    const incomes = await Income.find({userId}).sort({date: -1});

    const data = incomes.map((item) => ({
      Source: item.source,
      Amount: item.amount,
      Date: item.date
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Income");
    xlsx.writeFile(wb, "income_details.xlsx");
    res.download("income_details.xlsx");
  } catch (error) {
    res.status(500).json({message: "Server error"}); 
  }
}