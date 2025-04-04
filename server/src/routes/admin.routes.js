const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const router = express.Router();
const upload = require('../config/multer'); // Multer config for file uploads
const postController = require('../controllers/controller.post.js');
const authController = require('../controllers/controller.auth.js');
const adminController = require('../controllers/controller.admin.js');


router.get('/users',authController.auth,adminController.isAdmin,adminController.getUsers);
router.post('/users/:userId',authController.auth,adminController.isAdmin,adminController.changeRole);
router.post('/users/ban/:userId',authController.auth,adminController.isAdmin,adminController.banUser);



module.exports = router;