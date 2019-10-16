require("rootpath")();
const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./index.js");
const { port } = require("./config");
const app = express();
const cors = require("cors");
const localPort = 8081;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routes(app);

app.listen(localPort);
console.log("server runnig locally on port ", localPort);
