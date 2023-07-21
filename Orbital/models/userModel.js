const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  lists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "List"
  }],
  searchHistory: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model("User", userSchema);