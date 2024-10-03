const express = require("express");
const bodyParser = require("body-parser"); // parses different body types
const http = require("http"); // creates client functionality
const app = express();
const port = 3000;

app.use(bodyParser.json()); // it tells the express to accept every body
app.use(express.json()); // accept every post request that comes

app.use("/api/v1", require("./routes"));

app.use("/", (req, res) => {
  res.send("Welcome home!");
});

app.listen(port, () => console.log(`app listening on port ${port}`));
