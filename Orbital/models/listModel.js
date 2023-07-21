const mongoose = require("mongoose");

// Creates the blueprint for the new schema
const listSchema = new mongoose.Schema({
    // _id: false,
    // listId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   default: mongoose.Types.ObjectId
    // },
    listName: {
      type: String,
      required: true
    },
    placeIds: [String]
})

// Creates a model using the schema (Similar to JavaScript objects), which adds documents to the "jane" collection
const ListModel = mongoose.model("lists", listSchema, "jane");

// Export the saved list "object"
module.exports = ListModel;