const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/controller.auth.js');
const router = express.Router();


router.post('/register',authController.register);
router.post('/login',authController.login);
router.post('/logout',authController.logout);
router.get('/', authController.check);



module.exports = router;


