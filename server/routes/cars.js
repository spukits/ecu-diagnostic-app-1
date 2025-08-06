const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Car = require('../models/Car');

// 📥 Αποθήκευση νέας καταγραφής (με userId)
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId; // <-- ΠΕΡΝΑΣ ΜΟΝΟ ΤΟ userId!
    const car = new Car({ ...req.body, userId });
    await car.save();
    res.status(201).json(car);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📄 Ανάκτηση ιστορικού για συγκεκριμένο χρήστη
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const carId = req.query.carId;
    const query = { userId };
    if (carId) query.vin = carId;
    const history = await Car.find(query).sort({ timestamp: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// 📄 Τελευταία καταγραφή για όχημα συγκεκριμένου χρήστη
router.get('/latest', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const carId = req.query.carId;
    const latest = await Car.findOne({ vin: carId, userId }).sort({ timestamp: -1 });
    res.json(latest || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch latest record.' });
  }
});

// 🗑️ Διαγραφή όλων των καταγραφών του χρήστη
router.delete('/history', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    await Car.deleteMany({ userId });
    res.status(200).json({ message: 'Ιστορικό διαγράφηκε επιτυχώς.' });
  } catch (error) {
    res.status(500).json({ error: 'Σφάλμα κατά τη διαγραφή ιστορικού.' });
  }
});

// 🗑️ Διαγραφή συγκεκριμένης καταγραφής του χρήστη
router.delete('/history/:id', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const deleted = await Car.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return res.status(404).json({ message: 'Δεν βρέθηκε ή δεν ανήκει στον χρήστη.' });
    }
    res.status(200).json({ message: 'Η καταγραφή διαγράφηκε επιτυχώς.' });
  } catch (error) {
    res.status(500).json({ error: 'Αποτυχία διαγραφής καταγραφής.' });
  }
});

// 🧹 Εκκαθάριση DTCs μόνο για του χρήστη
router.post('/clear', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const carId = req.query.carId;
    await Car.updateMany({ vin: carId, userId }, { $set: { dtcs: [], milStatus: false } });
    res.json({ message: 'DTCs διαγράφηκαν επιτυχώς.' });
  } catch (error) {
    res.status(500).json({ error: 'Αποτυχία εκκαθάρισης DTCs.' });
  }
});

module.exports = router;
  



