const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const getProfile = async (req, res) => {
  const user = req.user;
  res.status(200).json({ user });
};

const getUser = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.params.user);

  try {
    const user = await User.findById(userId).select("username email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  const { username } = req.body;
  const user = req.user;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { username },
      { new: true }
    );
    res.status(200).json({ user: updatedUser });
  } catch (err) {
    res.status(400).json({ message: "Invalid user ID" });
  }
};

module.exports = { getProfile, getUser, updateProfile };
