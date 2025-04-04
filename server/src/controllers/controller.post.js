const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');
const Post = require('../models/post.model'); // Import your Post model
const { Readable } = require('stream');

// Create a post with an image
const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const image = req.file;  // Multer provides the image file as a buffer

    if (!image) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Convert the buffer into a readable stream
    const bufferStream = new Readable();
    bufferStream.push(image.buffer);
    bufferStream.push(null);  // Indicate the end of the stream

    // Upload the buffer stream to Cloudinary
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

    // Create the post with the image URL from Cloudinary
    const newPost = new Post({
      title,
      content,
      image: uploadResult.secure_url,  // Use the image URL returned by Cloudinary
      userId: req.user._id,  // Assuming the user is authenticated
    });

    // Save the post to the database
    await newPost.save();

    // Respond with the created post
    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating post' });
  }
};


const getPosts = async (req,res) =>{
      const posts = await Post.find({ isDeleted: false });
      if(!posts){
        res.status(404).json({success: false, message: "no posts found"});
      }

    return res.status(200).json({success: true, posts})
};

const getPost = async (req, res)=>{
const postId = req.params.postId;

const post =await Post.findById(postId);


if (!post || post.isDeleted){
  return res.status(404).json({success: false, message: "no post found with that id"});
}

const countUpvotes = post.upvotes.length;
const countComments = post.comments.length;

return res.status(200).json({success: true, post, countUpvotes, countComments});


};

const deletePost = async (req, res)=>{
const postId = req.params.postId;
const userId = req.user.id;

const post =await Post.findById(postId);

if (post.userId.toString() !== userId){

  return res.status(401).json({success: false, message: "unauthorized"});

}

await Post.findByIdAndUpdate(postId, { isDeleted: true });


return res.json({success: true, message: "post deleted succesfully"})





};


const comment = async (req, res) =>{
  const {content} = req.body;
  const postId = req.params.postId;
  const userId = req.user.id;

  const post = await Post.findById(postId);
  if(!post || post.isDeleted){
    return res.status(404).json({success: false, message: "invalid post"})
  }

  const  updatedPost = await Post.findByIdAndUpdate(postId,
    {
      $push: {comments: {content,userId}}
    },
    {new: true}
  );  
  
  return res.status(201).json({success: true, message:"post created successfully", post: updatedPost})



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

const deleteComment = async (req, res) =>{
  const commentId = req.params.commentId;
  const userId = req.user.id;
  const postId = req.params.postId;

  const post = await Post.findById(postId);

  if (!post || post.isDeleted) {
    return res.status(404).json({ success: false, message: "Invalid post" });
  }

  const comment = post.comments.id(commentId);

  if (!comment || comment.isDeleted) {
    return res.status(404).json({ success: false, message: "Comment not found" });
  }
  if (comment.userId.toString() !== userId){
    return res.status(401).json({success: false, message:" unauthorized" });
  }

  comment.isDeleted = true;

  await post.save();

  return res.status(200).json({ success: true, message: "comment deleted"});


};

const toggleUpvote = async(req,res) =>{
  const userId= req.user.id;
  const postId = req.params.postId;

  const post = await Post.findById(postId);
  if(!post || post.isDeleted){
    return res.status(404).json({success: false, message: " post not found"})
  }

   const hasUpvoted = post.upvotes.includes(userId);

   if (hasUpvoted) {
     await Post.updateOne(
       { _id: postId },
       { $pull: { upvotes: userId } } 
     );
 
     return res.status(200).json({ success: true, message: "Upvote removed" });
   }

     await Post.updateOne(
       { _id: postId },
       { $push: { upvotes: userId } } 
     );
 
     return res.status(200).json({ success: true, message: "Upvoted successfully" });




};



module.exports = { createPost, getPosts, getPost, deletePost, comment, getComments, deleteComment, toggleUpvote };
