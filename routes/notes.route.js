const express = require("express");
const route = express.Router();
const controller = require("../controllers/note.controller");
const { authenticateToken } = require("../utilities");


route.post("/add", authenticateToken, controller.addNotePost);

route.patch("/edit/:id", authenticateToken, controller.editNote);

route.get("/get-all", authenticateToken, controller.getAllNotes);

route.delete("/delete/:id", authenticateToken, controller.deleteNote);

route.patch("/update-pinned/:id", authenticateToken, controller.updatePinned);

route.get("/searching", authenticateToken, controller.searchNote);


module.exports = route;