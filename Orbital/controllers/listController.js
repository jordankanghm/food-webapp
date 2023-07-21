const mongoose = require("mongoose");
const List = require("../models/listModel");
const User = require("../models/userModel");

// Handlers
// Creates a new list for the user
// Request requires a username parameter and listName variable in body
exports.createNewList = async (req, res) => {
        console.log(`${req.params.username}`);
        // Get the username and listName from the request parameters and body
        const { username } = req.params;
        const { listName } = req.body;
        console.log(`${username}, ${listName}`);
    
        // Find the user collection by username
        const UserModel = mongoose.model(username, User.schema, username);
        const user = await UserModel.findOne({ username });
        console.log(`This is the user: ${user}`);

        // Check if a list with the same name already exists for the user
        const existingList = user.lists.find(list => list.listName === listName);
        if (existingList) {
            return res.status(400).json({
                status: "error",
                message: "List name already exists for this user",
            });
        }
    
        // Create a new list for the user
        const newList = await List.create({ listName, places: [] });
        console.log(`This is the new list created`)
        console.log(newList)
        user.lists.push(newList);
        console.log(`These are the lists: ${user.lists}`);
    
        // Save the updated user
        await user.save();
        console.log("User has been saved")
    
        res.status(201).json({
          status: "success",
          data: newList,
        });
    //   } catch (error) {
    //     res.status(500).json({
    //       status: "error",
    //       message: "Failed to create a new list",
    //       error
    //     });
    //   }
}

// Returns all lists of a user
// Request requires a userId parameter
exports.getAllLists = async (req, res) => {
    try {
        const { userId } = req.params;
    
        // Find the user by ID
        const user = await User.findById(userId);
    
        res.json({
          status: "success",
          data: user.lists,
        });
      } catch (error) {
        res.status(500).json({
          status: "error",
          message: "Failed to retrieve lists",
        });
      }
}

// Takes a place as input and adds it to the list
// Requires a userId and listId parameter and placeId variable in body)
exports.addNewPlace = async (req, res) => {
    try {
        const { userId, listId } = req.params;
        const { placeId } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);
        // Find the list within the user's lists array
        const list = user.lists.id(listId);

        if (!list) {
            return res.status(404).json({
              status: "error",
              message: "List not found",
            });
        }

        // Add the place to the list
        list.push(placeId);
        // Save the updated user
        user.save()

        res.json({
            status: "success",
            data: list
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to add a new place to the list"
        });
    }
}

// Returns all places in the specified list
// Requires a userId and listId parameter
exports.getListPlaces = async (req, res) => {
    try {
        const { userId, listId } = req.params;

        // Find the user by ID
        const user = await User.findById(userId);
        // Find the list within the user's lists array
        const list = user.lists.id(listId);

        if (!list) {
            return res.status(404).json({
              status: "error",
              message: "List not found",
            });
        }

        res.json({
            status: "success",
            data: list.placeIds
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to retrieve places in the list"
        });
    }
}

// Takes a name as input and changes the name of the list 
// Requires a userId and listId parameter and listName variable in body)
exports.updateListName = async (req, res) => {
    try {
        const { userId, listId } = req.params;
        const { listName } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);

        // Find the list within the user's lists array
        const list = user.lists.id(listId);

        if (!list) {
            return res.status(404).json({
                status: "error",
                message: "List not found",
            });
        }

        // Update the list name
        list.listName = listName;

        // Save the updated user
        await user.save();

        res.json({
            status: "success",
            data: list,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to update the name of the list"
        });
    }
}

// Removes the specified list
// Requires a userId and listId parameter
exports.deleteList = async (req, res) => {
    try {
        const { userId, listId } = req.params;

        // Find the user by ID
        const user = await User.findById(userId);

        // Find the list within the user's lists array
        const list = user.lists.id(listId);

        if (!list) {
            return res.status(404).json({
                status: "error",
                message: "List not found",
            });
        }

        // Remove the list from the user's lists array
        list.remove();

        // Save the updated user
        await user.save();

        res.json({
            status: "success",
            message: "List deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to delete the list"
        });
    }
}

// Deletes thes specified place 
// Requires a userId and listId parameter and placeId in body)
exports.deleteListPlace = async (req, res) => {
    try {
        const { userId, listId } = req.params;
        const { placeId } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);

        // Find the list within the user's lists array
        const list = user.lists.id(listId);

        if (!list) {
            return res.status(404).json({
                status: "error",
                message: "List not found",
            });
        }

        // Remove the place from the list
        const index = array.indexOf(placeId);
        if (index !== -1) {
            list.splice(index, 1);
        }

        // Save the updated user
        await user.save();

        res.json({
            status: "success",
            data: list
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to delete the place from the list"
        });
    }
}
