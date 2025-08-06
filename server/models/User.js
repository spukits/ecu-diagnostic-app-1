const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImg: { type: String, default: "" },
  settings: {
    language: { type: String, default: "el" },
    theme: { type: String, default: "light" },
    notifications: { type: Boolean, default: true },
    defaultCar: { type: String, default: "" },
    privacyMode: { type: Boolean, default: false }
  }
});

module.exports = mongoose.model("User", userSchema);
