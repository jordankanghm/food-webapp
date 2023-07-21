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
  lists: {
    type: [{
      listName: {
        type: String,
        required: true
      },
      placeIds: {
        type: [String]
      }
    }]
  },
  searchHistory: {
    type: [String],
    default: []
  }
});

module.exports = userSchema;