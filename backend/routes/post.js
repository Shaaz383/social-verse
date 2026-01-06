const mongoose = require("mongoose");

// Define the post schema
const postSchema = new mongoose.Schema({
  picture: {
    type: String,
  },
  caption: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },

  date: {
    type: Date,
    default: Date.now,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      comment: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: Date.now,
      },
      replies: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
          },
          comment: {
            type: String,
            required: true
          },
          date: {
            type: Date,
            default: Date.now,
          }
        }
      ]
    }
  ]
});

// Create the post model and export
module.exports = mongoose.model("post", postSchema);
