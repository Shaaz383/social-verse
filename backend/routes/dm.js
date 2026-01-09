var express = require("express");
var router = express.Router();

const jwt = require("jsonwebtoken");

const userModel = require("./users");
const Conversation = require("../models/conversation");
const Message = require("../models/message");

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}

function normalizePair(aId, bId) {
  const a = aId.toString();
  const b = bId.toString();
  if (a < b) return { participantA: aId, participantB: bId, participants: [aId, bId] };
  return { participantA: bId, participantB: aId, participants: [bId, aId] };
}

function canMessage(currentUser, otherUserId) {
  const otherIdStr = otherUserId.toString();
  const follows = (currentUser.following || []).some((id) => id.toString() === otherIdStr);
  const followedBy = (currentUser.followers || []).some((id) => id.toString() === otherIdStr);
  return follows || followedBy;
}

async function getCurrentUser(req) {
  return userModel.findOne({ username: req.session.passport.user });
}

router.get("/socket-token", isLoggedIn, async function (req, res) {
  try {
    const user = await getCurrentUser(req);
    const secret = process.env.SOCKET_SECRET_KEY || process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "Missing SOCKET_SECRET_KEY/JWT_SECRET" });
    }
    const token = jwt.sign({ sub: user._id.toString() }, secret, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/eligible-users", isLoggedIn, async function (req, res) {
  try {
    const user = await getCurrentUser(req);
    const eligibleIds = Array.from(
      new Set([...(user.followers || []).map(String), ...(user.following || []).map(String)])
    );
    if (eligibleIds.length === 0) return res.json({ users: [] });
    const users = await userModel
      .find({ _id: { $in: eligibleIds } })
      .select("_id username name profileImage");
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/with/:username", isLoggedIn, async function (req, res) {
  try {
    const user = await getCurrentUser(req);
    const other = await userModel.findOne({ username: req.params.username }).select("_id username name profileImage");
    if (!other) return res.status(404).json({ error: "User not found" });
    if (!canMessage(user, other._id)) return res.status(403).json({ error: "Messaging not allowed" });

    const pair = normalizePair(user._id, other._id);
    let conversation = await Conversation.findOne({ participantA: pair.participantA, participantB: pair.participantB });
    if (!conversation) {
      conversation = await Conversation.create({
        ...pair,
        lastMessageText: "",
        lastMessageAt: null,
      });
    }
    res.json({ conversationId: conversation._id, other });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/conversations", isLoggedIn, async function (req, res) {
  try {
    const user = await getCurrentUser(req);
    const conversations = await Conversation.find({ participants: user._id })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate("participants", "_id username name profileImage");

    const items = await Promise.all(
      conversations.map(async (c) => {
        const other = (c.participants || []).find((p) => p._id.toString() !== user._id.toString());
        const unreadCount = await Message.countDocuments({
          conversation: c._id,
          recipient: user._id,
          seenAt: null,
        });
        return {
          _id: c._id,
          other,
          lastMessageText: c.lastMessageText,
          lastMessageAt: c.lastMessageAt,
          unreadCount,
        };
      })
    );

    res.json({ conversations: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/conversations/:conversationId/messages", isLoggedIn, async function (req, res) {
  try {
    const user = await getCurrentUser(req);
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });
    const isMember = (conversation.participants || []).some((id) => id.toString() === user._id.toString());
    if (!isMember) return res.status(403).json({ error: "Forbidden" });

    const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);
    const messages = await Message.find({ conversation: conversation._id })
      .sort({ createdAt: 1 })
      .limit(limit)
      .select("_id conversation sender recipient text clientMessageId createdAt deliveredAt seenAt");

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/conversations/:conversationId/messages", isLoggedIn, async function (req, res) {
  try {
    const user = await getCurrentUser(req);
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });
    const isMember = (conversation.participants || []).some((id) => id.toString() === user._id.toString());
    if (!isMember) return res.status(403).json({ error: "Forbidden" });

    const otherId = (conversation.participants || []).find((id) => id.toString() !== user._id.toString());
    if (!otherId) return res.status(400).json({ error: "Invalid conversation" });
    if (!canMessage(user, otherId)) return res.status(403).json({ error: "Messaging not allowed" });

    const text = (req.body && req.body.text ? String(req.body.text) : "").trim();
    const clientMessageId = req.body && req.body.clientMessageId ? String(req.body.clientMessageId) : "";
    if (!text) return res.status(400).json({ error: "Message text required" });
    if (!clientMessageId) return res.status(400).json({ error: "clientMessageId required" });

    const now = new Date();
    const message = await Message.create({
      conversation: conversation._id,
      sender: user._id,
      recipient: otherId,
      text,
      clientMessageId,
      deliveredAt: now,
      seenAt: null,
    });

    await Conversation.updateOne(
      { _id: conversation._id },
      { $set: { lastMessageText: text, lastMessageAt: now } }
    );

    const io = req.app.get("io");
    if (io) {
      const payload = {
        _id: message._id,
        conversation: message.conversation,
        sender: message.sender,
        recipient: message.recipient,
        text: message.text,
        clientMessageId: message.clientMessageId,
        createdAt: message.createdAt,
        deliveredAt: message.deliveredAt,
        seenAt: message.seenAt,
      };
      io.to(`user:${user._id.toString()}`).emit("dm:message", payload);
      io.to(`user:${otherId.toString()}`).emit("dm:message", payload);
      const unreadCount = await Message.countDocuments({ recipient: otherId, seenAt: null });
      io.to(`user:${otherId.toString()}`).emit("dm:unread-count", { unreadCount });
    }

    res.json({ message });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: "Duplicate message" });
    }
    res.status(500).json({ error: err.message });
  }
});

router.post("/conversations/:conversationId/seen", isLoggedIn, async function (req, res) {
  try {
    const user = await getCurrentUser(req);
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });
    const isMember = (conversation.participants || []).some((id) => id.toString() === user._id.toString());
    if (!isMember) return res.status(403).json({ error: "Forbidden" });

    const now = new Date();
    await Message.updateMany(
      { conversation: conversation._id, recipient: user._id, seenAt: null },
      { $set: { seenAt: now } }
    );

    const io = req.app.get("io");
    if (io) {
      const unreadCount = await Message.countDocuments({ recipient: user._id, seenAt: null });
      io.to(`user:${user._id.toString()}`).emit("dm:unread-count", { unreadCount });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/unread-count", isLoggedIn, async function (req, res) {
  try {
    const user = await getCurrentUser(req);
    const unreadCount = await Message.countDocuments({ recipient: user._id, seenAt: null });
    res.json({ unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
