const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Get Profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user profile." });
  }
});

// Update Profile & Settings
router.put('/', auth, async (req, res) => {
  try {
    const { username, email, profileImg, settings } = req.body;
    const update = {};
    if (username) update.username = username;
    if (email) update.email = email;
    if (profileImg !== undefined) update.profileImg = profileImg;
    if (settings !== undefined) update.settings = settings;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: update },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user profile." });
  }
});

module.exports = router;
