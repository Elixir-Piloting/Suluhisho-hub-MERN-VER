const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');
const Post = require('../models/post.model'); 
const Comment = require('../models/comments.model');
const Upvote = require('../models/upvotes.model');
const { Readable } = require('stream');

const createPost = async (req, res) => {
  try {
    const { title, content, latitude, longitude,category } = req.body;
    const image = req.file;  
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    let imageUrl = null;
    if (image) {
      const bufferStream = new Readable();
      bufferStream.push(image.buffer);
      bufferStream.push(null);  
      const uploadResult = await new Promise((resolve, reject) => {
        bufferStream.pipe(cloudinary.uploader.upload_stream(
          { folder: 'posts', use_filename: true, unique_filename: false },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        ));
      });
      imageUrl = uploadResult.secure_url;  
    }

    let location = null;
    if (latitude && longitude) {
      location = {
        type: 'Point',
        coordinates: [longitude, latitude], 
      };
    }

    const newPost = new Post({
      title,
      content,
      image: imageUrl,  
      userId,
      location,  
      category
    });
  
    await newPost.save();
    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating post' });
  }
};



const getPosts = async (req, res) => {
  try {
    // Step 1: Get all posts
    const posts = await Post.find({ isDeleted: false })
      .populate('userId', 'username profilePic') // Add username from user
      .lean(); // Make results plain JS objects

    if (!posts.length) {
      return res.status(404).json({ success: false, message: "No posts found" });
    }

    // Step 2: Aggregate comment and upvote counts
    const [commentCounts, upvoteCounts] = await Promise.all([
      Comment.aggregate([
        { $match: { postId: { $in: posts.map(p => p._id) } } },
        { $group: { _id: "$postId", count: { $sum: 1 } } }
      ]),
      Upvote.aggregate([
        { $match: { postId: { $in: posts.map(p => p._id) } } },
        { $group: { _id: "$postId", count: { $sum: 1 } } }
      ])
    ]);

    // Step 3: Convert counts into fast-access maps
    const commentMap = Object.fromEntries(commentCounts.map(c => [c._id.toString(), c.count]));
    const upvoteMap = Object.fromEntries(upvoteCounts.map(u => [u._id.toString(), u.count]));

    // Step 4: Merge counts into posts
    const finalPosts = posts.map(post => ({
      ...post,
      commentCount: commentMap[post._id.toString()] || 0,
      upvoteCount: upvoteMap[post._id.toString()] || 0
    }));

    return res.status(200).json({ success: true, posts: finalPosts });

  } catch (error) {
    console.error("Error in getPosts:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getPost = async (req, res)=>{
const postId = req.params.postId;

const post =await Post.findById(postId);


if (!post || post.isDeleted){
  return res.status(404).json({success: false, message: "no post found with that id"});
}

const comments = await Comment.find({postId});
const upvotes = await Upvote.find({postId});




return res.status(200).json({success: true, post,comments,upvotes});


};

const deletePost = async (req, res)=>{
const postId = req.params.postId;
const userId = req.user.id;
const userRole = req.user.role;

const post =await Post.findById(postId);

if (post.userId.toString() !== userId && userRole !=="admin"){

  return res.status(401).json({success: false, message: "unauthorized"});

}

await Post.findByIdAndUpdate(postId, { isDeleted: true });


return res.json({success: true, message: "post deleted succesfully"})





};



const comment = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId;
    const userId = req.user.id;

    // Check if comment content exists and isn't just empty spaces
    if (!content || content.trim() === "") {
      return res.status(400).json({ success: false, message: "Comment content is required" });
    }

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post || post.isDeleted) {
      return res.status(404).json({ success: false, message: "Invalid or deleted post" });
    }

    // Create the comment and save it
    const newComment = new Comment({ postId, userId, content });
    await newComment.save();

    // Send only one response after the comment has been successfully created
    return res.status(201).json({
      success: true,
      message: "Comment created successfully",
      comment: newComment,
    });

  } catch (error) {
    // Log and send a proper error response if something goes wrong
    console.error("Error creating comment:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Server error while adding comment",
      });
    }
  }
};


const getComments = async (req, res) =>{
  const postId = req.params.postId;

  const post = await Post.findById(postId);

  if (!post || post.isDeleted) {
    return res.status(404).json({ success: false, message: "Invalid post" });
  }

  const comments = post.comments.filter(comment => !comment.isDeleted);

  if (!comment) {
    return res.status(404).json({ success: false, message: "Comment not found" });
  }
  return res.status(200).json({ success: true, comments });


};

const deleteComment = async (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.user.id;
  const userRole = req.user.role;
  const postId = req.params.postId;

  // Find the post to ensure it exists
  const post = await Post.findById(postId);
  if (!post || post.isDeleted) {
    return res.status(404).json({ success: false, message: "Invalid post" });
  }

  // Find the comment by ID
  const comment = await Comment.findById(commentId); // Use 'await' here

  if (!comment) {
    return res.status(404).json({ success: false, message: "Comment not found" });
  }

  // Check if the user is the author of the comment or an admin
  if (comment.userId.toString() !== userId && userRole !== "admin") {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  // Delete the comment
  await Comment.findByIdAndDelete(commentId);

  return res.status(200).json({ success: true, message: "Comment deleted" });
};


const toggleUpvote = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;

  const post = await Post.findById(postId);
  if (!post || post.isDeleted) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  // Check if the user has already upvoted
  const upvote = await Upvote.findOne({ postId, userId });

  if (upvote) {
    // If the user has already upvoted, delete the upvote (remove it)
    await Upvote.deleteOne({ postId, userId });
    return res.json({ message: "Upvote removed" });
  }

  // If the user hasn't upvoted yet, create a new upvote
  const newUpvote = new Upvote({ userId, postId });
  await newUpvote.save();

  return res.json({ message: "Upvoted" });
};



module.exports = { createPost, getPosts, getPost, deletePost, comment, getComments, deleteComment, toggleUpvote };
