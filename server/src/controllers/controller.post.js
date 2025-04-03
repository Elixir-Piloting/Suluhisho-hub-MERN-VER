const cloudinary = require('../config/cloudinary');
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

module.exports = { createPost };
