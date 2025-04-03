const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const router = express.Router();
const upload = require('../config/multer'); // Multer config for file uploads
const postController = require('../controllers/controller.post.js');
const authController = require('../controllers/controller.auth.js');

router.post('/create', upload.single('image'), authController.auth, postController.createPost);

module.exports = router;