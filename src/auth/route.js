let { Router } = require("express");
const {
  loginController,
  signUpController,
  resetPasswordController,
  signUpController2, requestOTP, verifyOTP, changeDetails
} = require("./controller");
let route = Router();

route.post("/login", loginController);
route.post("/signup", signUpController);
route.post("/reset-password", resetPasswordController);
route.post("/request-otp", requestOTP);
route.post("/verify-otp", verifyOTP);
route.post("/changeDetails", changeDetails)
route.post("/signup2", signUpController2);

module.exports = route;
