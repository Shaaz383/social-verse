var express = require("express");
var router = express.Router();

const userModel = require("./users");
const Notification = require("../models/notification");

const { authenticateToken } = require('../middleware/auth');

router.get("/", authenticateToken, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.user.username });
    
    const notifications = await Notification.find({ recipient: user._id })
      .populate("sender", "username profileImage")
      .populate("post", "picture")
      .sort({ createdAt: -1 });

    await Notification.updateMany({ recipient: user._id, read: false }, { read: true });

    res.json({ user, notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/unread-count", authenticateToken, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.user.username });
    const count = await Notification.countDocuments({ recipient: user._id, read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
