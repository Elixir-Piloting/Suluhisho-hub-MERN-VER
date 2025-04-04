const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');


const JWT_SECRET = process.env.JWT_SECRET;


const register = async (req,res)=>{
    const { username, password, email } = req.body;

    userExists = await User.findOne({email: email});

    if(userExists){
        return res.status(400).json({message: 'User already exists'});
    }

    const newUser = new User({username, password, email});

    await newUser.save();
    
    res.status(201).json({message: 'User registered successfully'});



};

const login = async (req, res) => {

    const { email, password } = req.body;
    const user = await User.findOne({email});
    if (!user ||!(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, {
        httpOnly: true,     
        secure: false,       
        maxAge: 3600000,    
        sameSite: 'Strict'  
      });
    res.status(200).json({ token }, { message: 'logged in success' });

};




const auth = async (req, res, next) => {
    const token = req.cookies.token;
  
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }
  
    try {
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);  
      
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      if(!user.isActive){
        return res.status(401).json({success: false, message: "this user is banned"})
      }
      
      req.user = user;
      next(); 
  
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired' });
      }
  
      res.status(401).json({ message: 'Invalid token', error: err.message });
    }
  };



const logout = async (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });

};


module.exports = {register, login, logout, auth};