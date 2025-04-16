const usersRoute = require("./users.route");
const notesRoute = require("./notes.route");
const dashboardRoute = require("./dashboard.route");
const incomeRoute = require("./income.route");
const expenseRoute = require("./expense.route");

module.exports = (app) => {
    app.use("/users", usersRoute);

    app.use("/notes", notesRoute);

    app.use("/incomes", incomeRoute);

    app.use("/expenses", expenseRoute);
    
    app.use("/dashboards", dashboardRoute);
}
