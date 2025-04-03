const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/controller.auth.js');
const profileController = require('../controllers/controller.profile.js');
const router = express.Router();

router.get('/',authController.auth, profileController.getProfile);
router.get('/:user', profileController.getUser);
router.patch('/update', authController.auth, profileController.updateProfile);

module.exports = router;