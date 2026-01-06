var express = require("express");
var router = express.Router();

const userModel = require("./users");
const postModel = require("./post");
const passport = require("passport");
const localStrategy = require("passport-local");

const crypto = require("crypto");
const nodemailer = require("nodemailer");
const async = require('async');

const upload = require("./multer");

passport.use(new localStrategy(userModel.authenticate()));

// Auth Check
router.get("/check-auth", function (req, res) {
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true, user: req.user });
  } else {
    res.json({ isAuthenticated: false });
  }
});

router.post("/register", function (req, res) {
  var userdata = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
  });
  userModel.register(userdata, req.body.password)
    .then(function (registereduser) {
      passport.authenticate("local")(req, res, function () {
        res.json({ success: true, user: registereduser });
      });
    })
    .catch(function(err) {
      res.status(500).json({ success: false, error: err.message });
    });
});

router.post("/login", function(req, res, next) {
  passport.authenticate("local", function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.status(401).json({ success: false, message: "Invalid credentials" }); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.json({ success: true, user: user });
    });
  })(req, res, next);
});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) return next(err);
    res.json({ success: true, message: "Logged out" });
  });
});

router.get("/profile", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/feed", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    const posts = await postModel.find().populate("user");
    res.json({ user, posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/mypost", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");
    res.json({ user, posts: user.posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post( "/upload", isLoggedIn, upload.single("image"), async function (req, res) {
  try {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });

    const postData = await postModel.create({
      picture: req.file.filename,
      caption: req.body.caption,
      user: user._id,
    });
    user.posts.push(postData._id);
    await user.save();
    res.json({ success: true, post: postData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/update", isLoggedIn, upload.single("image"), async function (req, res) {
  try {
    const updateData = {
      username: req.body.username,
      name: req.body.name,
      bio: req.body.bio
    };
    
    // Only update profile image if a new one is uploaded
    if (req.file) {
      // Logic to handle profile image update
       // Note: Current logic in original code was slightly different, adapting here
    }

    const user = await userModel.findOneAndUpdate(
      { username: req.session.passport.user },
      updateData,
      { new: true }
    ); 

    if (req.file) {
      user.profileImage = req.file.filename;
      await user.save();
    }
    
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/search", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  res.json({ user });
});

router.get("/username/:username", isLoggedIn, async function (req, res) {
  const regex = new RegExp(`^${req.params.username}`, "i");
  const users = await userModel.find({ username: regex });
  res.json(users)
});

// Other routes (follow, like, etc.) adapted to JSON
router.get("/like/post/:id", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    const post = await postModel.findOne({ _id: req.params.id }).populate('likes');

    if (post.likes.map(like => like._id).indexOf(user._id) === -1) {
      post.likes.push(user._id);
    } else {
      post.likes = post.likes.filter(like => like._id.toString() !== user._id.toString());
    }

    await post.save();
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}

module.exports = router;
