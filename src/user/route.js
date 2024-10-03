const { Router } = require("express");
const {getLoggedInUserController, refreshAccessController, deleteUserController, uploadFileController} = require("./controller")
const multer = require("multer")
const storage = multer.memoryStorage();
const upload = multer({storage})

let route = Router();

route.get("/loggedInUser", getLoggedInUserController)
route.post("/refresh-access", refreshAccessController)
route.post("/delete-user", deleteUserController)
route.post("/upload-photo", upload.single("file"), uploadFileController)

module.exports = route;
