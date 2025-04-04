const mongoose = require("mongoose");

const bannedUsersSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    required: true,
    default: "community guidelines",
  },
},{timestamps: true}

);


const Banned = new mongoose.model("Banned",bannedUsersSchema);

module.exports = Banned;