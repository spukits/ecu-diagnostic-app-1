const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
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
  timestamp: String,
  userId: { type: String, required: true } // <--- ΝΕΟ πεδίο!
});

module.exports = mongoose.model('Car', carSchema);


