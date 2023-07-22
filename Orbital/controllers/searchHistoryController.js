const mongoose = require("mongoose");
const userSchema = require("../models/userModel");

// Adds a query to the user's array of search history
// Requires a username parameter and query variable in the body
exports.createSearchHistory = async (req, res) => {
    try {
        const { username } = req.params;
        const { query } = req.body;

        // Get user by username
        const UserModel = mongoose.model(username, userSchema, username);
        const user = await UserModel.findOne({username});

        // Add to user's search history
        user.searchHistory.push(query);

        // Save changes
        await user.save();

        res.status(201).json({
            status: "success",
            data: user.searchHistory
        })
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to create search history",
            error
        });
    }
}

// Returns the user's search history
// Requires a username parameter
exports.getSearchHistory = async (req, res) => {
    try {
        const { username } = req.params;

        const UserModel = mongoose.model(username, userSchema, username);
        const user = await UserModel.findOne({username});

        res.json({
            status: "success",
            data: user.searchHistory
        })
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to get search history",
            error
        });
    }
}