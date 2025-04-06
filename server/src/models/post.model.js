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
      type: String,
      default: null,
    },
    category:{
      type: String,
      default: "general",
      
    },

    resolved:{
      type: Boolean,
      default: false

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
    
    isDeleted: {
      type: Boolean,
      default: false,
    },
    location: {
      type: {
        type: String, // Must be 'Point'
        enum: ['Point'], // Ensures we only store points
      },
      coordinates: {
        type: [Number], // Array of [longitude, latitude]
      },
    },
  },
  { timestamps: true }
);

// Creating an index for efficient geospatial queries
postSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Post', postSchema);
