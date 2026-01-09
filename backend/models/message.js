const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "conversation", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    text: { type: String, required: true, trim: true, maxlength: 4000 },
    clientMessageId: { type: String, required: true },
    deliveredAt: { type: Date, default: null },
    seenAt: { type: Date, default: null },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ sender: 1, clientMessageId: 1 }, { unique: true });
messageSchema.index({ recipient: 1, seenAt: 1, createdAt: -1 });

module.exports = mongoose.model("message", messageSchema);

