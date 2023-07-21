const mongoose = require("mongoose");
const User = require("../models/userModel");

// WORKS!!
// Create a new user and associated collection
exports.createUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    console.log(`${name}, ${email}, ${username}, ${password}`);

    // Check if a collection with the same username already exists
    const collectionExists = mongoose.connection.collections[username];
    if (collectionExists) {
      return res.status(400).json({
        status: "error",
        message: "User with the same username already exists",
      });
    }
    console.log("Username is unique")

    // Create a new model with the specified collection name and schema
    const CollectionModel = mongoose.model(username, User.schema, username);
    console.log(`New model is created with name: ${username}`)

    const newUser = CollectionModel.create({
        name,
        email,
        username,
        password,
        lists: [],
        searchHistory: []
    })

    // Now, you have a new collection with the same name as the username
    // You can perform CRUD operations on this collection using CollectionModel

    res.status(201).json({
      status: "success",
      data: newUser,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to create a new user",
      error: err,
    });
  }
};