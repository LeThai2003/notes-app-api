const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema, "users");

module.exports = User;