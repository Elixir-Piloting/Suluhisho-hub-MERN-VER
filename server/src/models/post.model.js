const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,  // Store the URL of the image
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Comments array, each comment is an object with user, content, and createdAt
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',  // Reference to the User model
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Array of upvoted users
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Store the userId of the users who upvoted the post
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
