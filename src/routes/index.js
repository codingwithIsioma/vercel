let { Router } = require("express"); // helps or controls routing from page to page
let route = Router();

// create new routes with the base url /api/v1/...
// auth route
route.use("/auth", require("../auth/route.js")); // re-directs the endpoint to the file route.js in the dir 'auth', and performs the functions of the specific endpoint inputted by client.

// transaction route
route.use("/transactions", require("../transactions/route.js"));

// user route
route.use("/user", require("../user/route.js"))

module.exports = route;
