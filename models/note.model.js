const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    title: {type: String, require: true},
    content: {type: String, require: true},
    tags: {type: [String], default: []},
    isPinned: {type: Boolean, default: false},
    userId: {type: String, require: true}
}, {
    timestamps: true
});

const Note = mongoose.model("Note", noteSchema, "notes");

module.exports = Note;