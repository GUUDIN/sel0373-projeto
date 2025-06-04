const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {                // session ID
    type: String,
    required: true,
    unique: true
  },
  password: {               // Hashed Password
    type: String,
    required: true
  },
  project: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
