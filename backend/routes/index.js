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
    const user = await userModel.findOne({ username: req.session.passport.user })
      .populate("posts")
      .populate("followers")
      .populate("following");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/feed", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    const posts = await postModel.find()
      .populate("user")
      .populate({ path: "comments.user", model: "user" })
      .populate({ path: "comments.replies.user", model: "user" });
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
      picture: req.file.path,
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
      user.profileImage = req.file.path;
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

router.post("/deletepost/:id", isLoggedIn, async function (req, res) {
  try {
    const post = await postModel.findOneAndDelete({ _id: req.params.id });
    const user = await userModel.findOne({ username: req.session.passport.user });
    user.posts.pull(req.params.id);
    await user.save();
    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/comment/:id", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    const post = await postModel.findOne({ _id: req.params.id });
    
    post.comments.push({
      user: user._id,
      comment: req.body.comment
    });
    
    await post.save();
    
    const populatedPost = await postModel.findOne({ _id: req.params.id })
        .populate("user")
        .populate({ path: "comments.user", model: "user" })
        .populate({ path: "comments.replies.user", model: "user" });

    res.json({ success: true, post: populatedPost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/comment/reply/:postId/:commentId", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    const post = await postModel.findOne({ _id: req.params.postId });
    
    const commentIndex = post.comments.findIndex(c => c._id.toString() === req.params.commentId);
    if (commentIndex === -1) return res.status(404).json({ error: "Comment not found" });

    post.comments[commentIndex].replies.push({
      user: user._id,
      comment: req.body.comment
    });

    await post.save();
    
    const populatedPost = await postModel.findOne({ _id: req.params.postId })
        .populate("user")
        .populate({ path: "comments.user", model: "user" })
        .populate({ path: "comments.replies.user", model: "user" });

    res.json({ success: true, post: populatedPost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/userprofile/:username", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    const userProfile = await userModel.findOne({ username: req.params.username }).populate("posts");
    
    if (!userProfile) return res.status(404).json({ error: "User not found" });

    res.json({ user, userProfile, userPosts: userProfile.posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/follow/:username", isLoggedIn, async function (req, res) {
  try {
    const follower = await userModel.findOne({ username: req.session.passport.user });
    const following = await userModel.findOne({ username: req.params.username });

    if (follower.following.indexOf(following._id) === -1) {
      follower.following.push(following._id);
      following.followers.push(follower._id);
    }
    
    await follower.save();
    await following.save();
    res.json({ success: true, message: "Followed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/unfollow/:username", isLoggedIn, async function (req, res) {
  try {
    const follower = await userModel.findOne({ username: req.session.passport.user });
    const following = await userModel.findOne({ username: req.params.username });

    if (follower.following.indexOf(following._id) !== -1) {
      follower.following.pull(following._id);
      following.followers.pull(follower._id);
    }
    
    await follower.save();
    await following.save();
    res.json({ success: true, message: "Unfollowed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/forgot", async function (req, res) {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Mock email sending
    console.log(`Reset token for ${user.email}: ${token}`);
    
    // In production, use nodemailer here
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail({ ... });

    res.json({ success: true, message: "Email sent", token }); // Sending token in response for dev purposes
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/reset/:token", async function (req, res) {
  try {
    const user = await userModel.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: "Token is invalid or has expired" });

    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    await user.setPassword(req.body.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.logIn(user, function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: "Password updated" });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/notification", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    const posts = await postModel.find({ user: user._id })
      .populate("likes")
      .populate({ path: "comments.user", model: "user" })
      .populate({ path: "comments.replies.user", model: "user" });
    res.json({ user, posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/message", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    const users = await userModel.find({ _id: { $ne: user._id } }); // All users except current
    res.json({ user, users });
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
