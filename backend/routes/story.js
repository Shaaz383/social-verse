var express = require("express");
var router = express.Router();

const userModel = require("./users");
const storyModel = require("../models/story");
const upload = require("./multer");
const { authenticateToken } = require('../middleware/auth');

router.post("/upload", authenticateToken, upload.single("image"), async function (req, res) {
    try {
        const user = await userModel.findOne({
            username: req.user.username,
        });

        const story = await storyModel.create({
            image: req.file.path,
            user: user._id,
        });

        user.stories.push(story._id);
        await user.save();
        res.json({ success: true, story: story });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/feed", authenticateToken, async function (req, res) {
    try {
        const user = await userModel.findOne({ username: req.user.username }).populate("following");
        const followingIds = user.following.map(f => f._id);
        const authorIds = [user._id, ...followingIds];

        const stories = await storyModel.find({ user: { $in: authorIds } }).populate("user").populate("viewers", "username name").populate("likes", "username name");

        res.json({ stories });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/:id", authenticateToken, async function (req, res) {
    try {
        const user = await userModel.findOne({ username: req.user.username });
        const story = await storyModel.findOne({ _id: req.params.id, user: user._id });

        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }

        await storyModel.findByIdAndDelete(req.params.id);
        user.stories.pull(req.params.id);
        await user.save();

        res.json({ success: true, message: "Story deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/view/:id", authenticateToken, async function (req, res) {
    try {
        const user = await userModel.findOne({ username: req.user.username });
        const story = await storyModel.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }

        if (!story.viewers.includes(user._id)) {
            story.viewers.push(user._id);
            await story.save();
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/like/:id", authenticateToken, async function (req, res) {
    try {
        const user = await userModel.findOne({ username: req.user.username });
        const story = await storyModel.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }

        const isLiked = story.likes.includes(user._id);
        if (isLiked) {
            story.likes = story.likes.filter(id => id.toString() !== user._id.toString());
        } else {
            story.likes.push(user._id);
        }

        await story.save();
        res.json({ success: true, liked: !isLiked, likesCount: story.likes.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
