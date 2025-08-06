const mongoose = require('mongoose');

const carDataSchema = new mongoose.Schema({
  vin: String,
  rpm: Number,
  speed: Number,
  engineTemp: Number,
  fuelLevel: Number,
  throttle: Number,
  engineLoad: Number,
  intakePressure: Number,
  intakeAirTemp: Number,
  engineRuntime: Number,
  fuelPressure: Number,
  milStatus: Boolean,
  dtcs: [String],
  timestamp: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mode: { type: String, enum: ["demo", "real"], required: true }  // <-- ΑΥΤΟ ΠΡΟΣΘΕΤΕΙΣ!
});

module.exports = mongoose.model('CarData', carDataSchema);


