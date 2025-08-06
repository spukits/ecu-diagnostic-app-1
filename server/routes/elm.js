const express = require('express');
const SerialPort = require('serialport');
const router = express.Router();

let elmPort = null;

router.post('/connect', async (req, res) => {
  const { port } = req.body; // π.χ. "COM3"
  try {
    elmPort = new SerialPort(port, { baudRate: 38400, autoOpen: false });

    elmPort.open((err) => {
      if (err) {
        return res.status(500).json({ message: "Δεν μπόρεσα να ανοίξω τη θύρα!", error: err.message });
      }
      // Αρχικοποίηση (στείλε ATZ)
      elmPort.write("ATZ\r");
      res.json({ message: "Συνδέθηκες επιτυχώς στο ELM327!" });
    });
  } catch (err) {
    res.status(500).json({ message: "Σφάλμα σύνδεσης!", error: err.message });
  }
});

module.exports = router;
