const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,

    college: String,
    year: String,
    branch: String,

    skills: [String],
    interests: [String]
});

module.exports = mongoose.model("User", UserSchema);