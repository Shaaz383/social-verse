var express = require("express");
var router = express.Router();

const userModel = require("./users");
const storyModel = require("../models/story");
const upload = require("./multer");

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: "Unauthorized" });
}

router.post("/upload", isLoggedIn, upload.single("image"), async function (req, res) {
    try {
        const user = await userModel.findOne({
            username: req.session.passport.user,
        });

        const story = await storyModel.create({
            image: `http://localhost:3000/images/uploads/${req.file.filename}`,
            user: user._id,
        });

        user.stories.push(story._id);
        await user.save();
        res.json({ success: true, story: story });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/feed", isLoggedIn, async function (req, res) {
    try {
        const user = await userModel.findOne({ username: req.session.passport.user }).populate("following");
        const followingIds = user.following.map(f => f._id);
        const authorIds = [user._id, ...followingIds];

        const stories = await storyModel.find({ user: { $in: authorIds } }).populate("user");

        res.json({ stories });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
