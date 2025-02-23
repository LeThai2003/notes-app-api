const usersRoute = require("./users.route");
const notesRoute = require("./notes.route");

module.exports = (app) => {
    app.use("/users", usersRoute);

    app.use("/notes", notesRoute)
}
