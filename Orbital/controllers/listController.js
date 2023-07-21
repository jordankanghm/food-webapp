const mongoose = require("mongoose");
// const List = require("../models/listModel");
const User = require("../models/userModel");

// Handlers

// WORKS!!
// Creates a new list for the user
// Request requires a username parameter and listName variable in body
exports.createNewList = async (req, res) => {
    try {
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
        const newList = { 
            listName, 
            places: [] 
        };
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
      } catch (error) {
        res.status(500).json({
          status: "error",
          message: "Failed to create a new list",
          error
        });
      }
}

// WORKS!!
// Returns all lists of a user
// Request requires a username parameter
exports.getAllLists = async (req, res) => {
    try {
        const { username } = req.params;
        console.log(`username is ${username}`);
    
        // Find the user by username
        const UserModel = mongoose.model(username, User.schema, username)
        const user = await UserModel.findOne({username});
        console.log("User is: ")
        console.log(user);
    
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

// WORKS!!
// Takes a place as input and adds it to the list
// Requires a username and listId parameter and placeId variable in body)
exports.addNewPlace = async (req, res) => {
    try {
        const { username, listId } = req.params;
        const { placeId } = req.body;
        console.log(`Username: ${username}`)
        console.log(`listId: ${listId}`)
        console.log(`placeId: ${placeId}`)

        // Find the user by username
        const UserModel = mongoose.model(username, User.schema, username);
        const user = await UserModel.findOne({username});
        console.log("User is: ")
        console.log(user);

        if (listId >= user.lists.length || listId < 0) {
            return res.status(404).json({
              status: "error",
              message: "List not found",
            });
        }
        console.log("List exists")

        // Find the list within the user's lists array
        const list = user.lists[listId];
        console.log(`Selected list is: ${list}`)

         // Check if the place already exists in the list
         const existingPlace = list.placeIds.find(place => place === placeId);
         if (existingPlace) {
             return res.status(400).json({
                 status: "error",
                 message: "Place already exists in the list",
             });
         }

        // Add the place to the list
        list.placeIds.push(placeId);
        console.log(`Updated list is: ${list}`)

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

// WORKS!!
// Returns the specified list
// Requires a username and listId parameter
exports.getList = async (req, res) => {
    try {
        const { username, listId } = req.params;

        // Find the user by username
        const UserModel = mongoose.model(username, User.schema, username);
        const user = await UserModel.findOne({username});

        if (listId >= user.lists.length || listId < 0) {
            return res.status(404).json({
              status: "error",
              message: "List not found",
            });
        }

        res.json({
            status: "success",
            data: user.lists[listId]
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to retrieve the list"
        });
    }
}

// Takes a name as input and changes the name of the list 
// Requires a username and listId parameter and listName variable in body)
exports.updateListName = async (req, res) => {
    try {
        const { username, listId } = req.params;
        const { listName } = req.body;

        // Find the user by username
        const UserModel = mongoose.model(username, User.schema, username);
        const user = await UserModel.findOne({username});

        if (listId >= user.lists.length || listId < 0) {
            return res.status(404).json({
              status: "error",
              message: "List not found",
            });
        }

        // Find the list within the user's lists array
        const list = user.lists[listId];

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

// WORKS!!
// Removes the specified list
// Requires a username parameter and listId variable from body
exports.deleteList = async (req, res) => {
    try {
        const { username } = req.params;
        const { listId } = req.body

        // Find the user by username
        const UserModel = mongoose.model(username, User.schema, username);
        const user = await UserModel.findOne({username});

        if (listId >= user.lists.length || listId < 0) {
            return res.status(404).json({
              status: "error",
              message: "List not found",
            });
        }

        // Find the list within the user's lists array
        const list = user.lists[listId];

        // Remove the list from the user's lists array
        list.remove();
        user.lists.splice(listId, 1);

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

// WORKS!!
// Deletes the specified place 
// Requires a username and listId parameter and placeId in body)
exports.deleteListPlace = async (req, res) => {
    try {
        const { username, listId } = req.params;
        const { placeId } = req.body;
        console.log(`Username: ${username}`)
        console.log(`listId: ${listId}`)
        console.log(`placeId: ${placeId}`)

        // Find the user by username
        const UserModel = mongoose.model(username, User.schema, username);
        const user = await UserModel.findOne({username});
        console.log("User is: ")
        console.log(user);

        if (listId >= user.lists.length || listId < 0) {
            return res.status(404).json({
              status: "error",
              message: "List not found",
            });
        }
        console.log("List exists")

        // Find the list within the user's lists array
        const list = user.lists[listId];
        console.log(`List is ${list}`)

        // Remove the place from the list
        const index = list.placeIds.indexOf(placeId);
        console.log(`Index is: ${index}`)
        if (index !== -1) {
            list.placeIds.splice(index, 1);
            console.log(`New placeIds is: ${list.placeIds}`)
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
