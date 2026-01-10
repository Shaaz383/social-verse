var express = require("express");
var router = express.Router();

const userModel = require("./users");
const postModel = require("./post");
const Notification = require("../models/notification");
// const passport = require("passport"); // Removed
// const localStrategy = require("passport-local"); // Removed
const { authenticateToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const crypto = require("crypto");
const nodemailer = require("nodemailer");
const async = require('async');

const upload = require("./multer");

// passport.use(new localStrategy(userModel.authenticate())); // Removed

// Auth Check (Verify Token)
router.get("/check-auth", authenticateToken, function (req, res) {
  res.json({ isAuthenticated: true, user: req.user });
});

router.post("/register", async function (req, res) {
  try {
    const { username, name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await userModel.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Username or email already exists" });
    }

    const newUser = new userModel({
      username,
      name,
      email,
      password
    });

    await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    res.json({ success: true, token, user: newUser });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/login", async function(req, res, next) {
  try {
    const { username, password } = req.body;
    
    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    res.json({ success: true, token, user });

  } catch (err) {
    next(err);
  }
});

router.get("/logout", function (req, res) {
  // Client should clear token
  res.json({ success: true, message: "Logged out" });
});

router.get("/profile", authenticateToken, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.user.username }) // req.user set by middleware
      .populate("posts")
      .populate("followers")
      .populate("following")
      .populate({
        path: "stories",
        populate: [
          { path: "viewers" },
          { path: "user" }
        ]
      });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/feed", authenticateToken, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.user.username });
    const authorIds = [user._id, ...user.following];
    const posts = await postModel.find({ user: { $in: authorIds } })
      .populate("user")
      .populate({ path: "comments.user", model: "user" })
      .populate({ path: "comments.replies.user", model: "user" });
    let suggestions = [];
    if (!posts.length) {
      suggestions = await userModel
        .find({
          _id: { $nin: authorIds },
          posts: { $exists: true, $ne: [] },
        })
        .select("username name profileImage")
        .limit(8);
    }
    res.json({ user, posts, suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/mypost", authenticateToken, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.user.username }).populate("posts");
    res.json({ user, posts: user.posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post( "/upload", authenticateToken, upload.single("image"), async function (req, res) {
  try {
    const user = await userModel.findOne({
      username: req.user.username,
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

router.post("/update", authenticateToken, upload.single("image"), async function (req, res) {
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
      { username: req.user.username },
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

router.get("/search", authenticateToken, async function (req, res) {
  const user = await userModel.findOne({ username: req.user.username })
  res.json({ user });
});

router.get("/username/:username", authenticateToken, async function (req, res) {
  const regex = new RegExp(`^${req.params.username}`, "i");
  const users = await userModel.find({ username: regex });
  res.json(users)
});

// Other routes (follow, like, etc.) adapted to JSON
router.get("/like/post/:id", authenticateToken, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.user.username });
    const post = await postModel.findOne({ _id: req.params.id }).populate('likes');

    if (post.likes.map(like => like._id).indexOf(user._id) === -1) {
      post.likes.push(user._id);
      
      // Create notification
      if (post.user.toString() !== user._id.toString()) {
        const notif = await Notification.create({
          recipient: post.user,
          sender: user._id,
          type: "like",
          post: post._id
        });
        const io = req.app.get("io");
        if (io) {
          io.to(`user:${post.user.toString()}`).emit("notification:new", notif);
        }
      }
    } else {
      post.likes = post.likes.filter(like => like._id.toString() !== user._id.toString());
    }

    await post.save();
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/deletepost/:id", authenticateToken, async function (req, res) {
  try {
    const post = await postModel.findOneAndDelete({ _id: req.params.id });
    const user = await userModel.findOne({ username: req.user.username });
    user.posts.pull(req.params.id);
    await user.save();
    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/comment/:id", authenticateToken, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.user.username });
    const post = await postModel.findOne({ _id: req.params.id });
    
    post.comments.push({
      user: user._id,
      comment: req.body.comment
    });
    
    await post.save();
    
    // Create notification
    if (post.user.toString() !== user._id.toString()) {
      const notif = await Notification.create({
        recipient: post.user,
        sender: user._id,
        type: "comment",
        post: post._id,
        commentText: req.body.comment
      });
      const io = req.app.get("io");
      if (io) {
        io.to(`user:${post.user.toString()}`).emit("notification:new", notif);
      }
    }
    
    const populatedPost = await postModel.findOne({ _id: req.params.id })
        .populate("user")
        .populate({ path: "comments.user", model: "user" })
        .populate({ path: "comments.replies.user", model: "user" });

    res.json({ success: true, post: populatedPost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/comment/reply/:postId/:commentId", authenticateToken, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.user.username });
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

router.get("/userprofile/:username", authenticateToken, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.user.username });
    const userProfile = await userModel.findOne({ username: req.params.username }).populate("posts");
    
    if (!userProfile) return res.status(404).json({ error: "User not found" });

    res.json({ user, userProfile, userPosts: userProfile.posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/follow/:username", authenticateToken, async function (req, res) {
  try {
    const follower = await userModel.findOne({ username: req.user.username });
    const following = await userModel.findOne({ username: req.params.username });

    if (follower.following.indexOf(following._id) === -1) {
      follower.following.push(following._id);
      following.followers.push(follower._id);

      // Create notification
      const notif = await Notification.create({
        recipient: following._id,
        sender: follower._id,
        type: "follow"
      });
      const io = req.app.get("io");
      if (io) {
        io.to(`user:${following._id.toString()}`).emit("notification:new", notif);
      }
    }
    
    await follower.save();
    await following.save();
    res.json({ success: true, message: "Followed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/unfollow/:username", authenticateToken, async function (req, res) {
  try {
    const follower = await userModel.findOne({ username: req.user.username });
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

router.post("/remove-follower/:id", authenticateToken, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.user.username });
    const followerToRemove = await userModel.findById(req.params.id);

    if (!followerToRemove) return res.status(404).json({ error: "User not found" });

    // Remove them from my followers
    if (user.followers.indexOf(followerToRemove._id) !== -1) {
      user.followers.pull(followerToRemove._id);
    }

    // Remove me from their following
    if (followerToRemove.following.indexOf(user._id) !== -1) {
      followerToRemove.following.pull(user._id);
    }

    await user.save();
    await followerToRemove.save();
    res.json({ success: true, message: "Follower removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/post/:id", authenticateToken, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.user.username });
    const post = await postModel.findOne({ _id: req.params.id })
      .populate("user")
      .populate({ path: "comments.user", model: "user" })
      .populate({ path: "comments.replies.user", model: "user" });
    
    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json({ user, post });
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

router.post("/save/:id", authenticateToken, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.user.username });
    if (user.saved.indexOf(req.params.id) === -1) {
      user.saved.push(req.params.id);
      await user.save();
    }
    res.json({ success: true, saved: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/unsave/:id", authenticateToken, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.user.username });
    user.saved.pull(req.params.id);
    await user.save();
    res.json({ success: true, saved: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/saved-posts", authenticateToken, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.user.username })
      .populate({
        path: "saved",
        populate: [
          { path: "user" },
          { path: "comments.user", model: "user" },
          { path: "comments.replies.user", model: "user" }
        ]
      });
    res.json({ user, posts: user.saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/message", authenticateToken, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.user.username });
    const users = await userModel.find({ _id: { $ne: user._id } }); // All users except current
    res.json({ user, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;