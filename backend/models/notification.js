const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  type: { type: String, enum: ["like", "comment", "follow"], required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "post" }, // Optional, for likes/comments
  commentText: { type: String }, // Optional, for comments
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model("notification", notificationSchema);
