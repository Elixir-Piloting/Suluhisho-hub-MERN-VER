const express = require("express");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Banned = require("../models/banned.users.model");

const isAdmin = async (req, res, next) => {
  const user = req.user;

  if (user.role !== "admin") {
    return res.status(401).json({ success: false, message: "Unauthorised" });
  }
  req.user = user;
  next();
};

const getUsers = async (req, res) => {
  const users = await User.find();

  if (!users) {
    return res
      .status(404)
      .json({ success: false, message: "no user registerd yet" });
  }

  return res.status(200).json({ success: true, users });
};

const changeRole = async (req, res) => {
  const userId = req.params.userId;
  const newRole = req.body.role;

  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    return res
      .status(404)
      .json({ success: false, message: "user does not exist or is banned" });
  }
  if (newRole !== "admin" && newRole !== "user") {
    return res.status(400).json({ success: false, message: "invalid input" });
  }

  await User.findByIdAndUpdate(userId, {
    role: newRole,
  });
  return res
    .status(200)
    .json({ success: true, message: "User role updated successfully" });
};

const banUser = async (req, res) => {
    const userId = req.params.userId;
    const reason = req.body.reason;
  
    const user = await User.findById(userId);
  
    if (!user) {
      return res.status(404).json({ success: false, message: "User does not exist" });
    }
  
    if (user.role === "admin") {
      return res.status(400).json({ success: false, message: "Cannot ban an admin" });
    }
  
    if (user.isActive === false) {
      await User.findByIdAndUpdate(
        userId,
        { isActive: true },  
        { new: true }
      );
  
      return res.status(200).json({ success: true, message: "User unbanned successfully" });
    }
  
    await User.findByIdAndUpdate(
      userId,
      { isActive: false },  
      { new: true }
    );
  
    const bannedUserdoc = new Banned({ userId, reason });
    await bannedUserdoc.save();
  
    return res.status(200).json({ success: true, message: "User banned successfully" });
  };
  
  

module.exports = { isAdmin, getUsers, changeRole, banUser };
