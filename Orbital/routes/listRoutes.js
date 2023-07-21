const express = require("express");
const listController = require("../controllers/listController");
// Add { mergeParams: true } to merge parent route params with child route params
const router = express.Router({ mergeParams: true }); 

router
    .route("/")
    .post(listController.createNewList)
    .get(listController.getAllLists)

router
    .route("/:listId")
    .get(listController.getListPlaces)
    .post(listController.addNewPlace)
    .patch(listController.updateListName)
    .delete(listController.deleteList)
    .delete(listController.deleteListPlace)

module.exports = router;