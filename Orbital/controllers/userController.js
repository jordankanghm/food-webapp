const mongoose = require("mongoose");
const userSchema = require("../models/userModel");

// WORKS!!
// Create a new user and associated collection
exports.createUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    // Check if a collection with the same username already exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some((collection) => collection.name === username);    
    if (collectionExists) {
      return res.status(400).json({
        status: "error",
        message: "User with the same username already exists",
      });
    }

    // Create a new model with the specified collection name and schema
    const CollectionModel = mongoose.model(username, userSchema, username);

    const newUser = await CollectionModel.create({
        name,
        email,
        username,
        password,
        lists: [],
        searchHistory: []
    })

    res.status(201).json({
      status: "success",
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to create a new user",
      error
    });
  }
};