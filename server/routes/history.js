const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const CarData = require('../models/CarData');

// Δημιουργία νέου record (ΜΕ validation για mode: demo/real)
router.post('/history', auth, async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.user.userId);

    // --- VALIDATION: Απαιτούμενο το mode ("demo" ή "real") ---
    const { mode } = req.body;
    if (!mode || !["demo", "real"].includes(mode)) {
      return res.status(400).json({ message: "Το mode πρέπει να είναι 'demo' ή 'real'" });
    }

    // Φτιάχνεις το νέο record με όλα τα πεδία του body + userId
    const newRecord = new CarData({ ...req.body, userId });
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Επιστρέφει ΟΛΑ τα ιστορικά του χρήστη (demo & real)
router.get('/history', auth, async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.user.userId);
    const records = await CarData.find({ userId }).sort({ timestamp: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// --- Επιστρέφει ΜΟΝΟ τα demo records του χρήστη (αν θέλεις ξεχωριστά) ---
router.get('/history/demo', auth, async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.user.userId);
    const records = await CarData.find({ userId, mode: "demo" }).sort({ timestamp: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// --- Επιστρέφει ΜΟΝΟ τα real records του χρήστη (αν θέλεις ξεχωριστά) ---
router.get('/history/real', auth, async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.user.userId);
    const records = await CarData.find({ userId, mode: "real" }).sort({ timestamp: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;



