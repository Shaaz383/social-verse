const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participantA: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    participantB: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }],
    lastMessageText: { type: String, default: "" },
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true }
);

conversationSchema.index({ participantA: 1, participantB: 1 }, { unique: true });
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model("conversation", conversationSchema);

