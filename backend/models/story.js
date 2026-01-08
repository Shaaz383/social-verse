const mongoose = require('mongoose');

const storySchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  image: String,
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // 24 hours
  }
});

module.exports = mongoose.model('story', storySchema);
