const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const router = express.Router();
const upload = require('../config/multer'); // Multer config for file uploads
const postController = require('../controllers/controller.post.js');
const authController = require('../controllers/controller.auth.js');
const adminController = require('../controllers/controller.admin.js');

router.post('/create', upload.single('image'), authController.auth, postController.createPost);
router.get('/', postController.getPosts);
router.get('/:postId', postController.getPost);
router.delete('/:postId',authController.auth, postController.deletePost);
router.post('/:postId/comment',authController.auth, postController.comment);
router.get('/:postId/comments', postController.getComments);
router.delete('/:postId/comment/:commentId', authController.auth, postController.deleteComment);
router.post('/:postId/upvote', authController.auth, postController.toggleUpvote);



module.exports = router;