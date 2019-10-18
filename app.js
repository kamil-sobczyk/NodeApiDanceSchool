require("rootpath")();
const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./index.js");
const {port} = require("./config");
const app = express();
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");
const localPort = 8081;

cloudinary.config({
  cloud_name: process.env.cloudName,
  api_key: process.env.apiKey,
  api_secret: process.env.apiSecret
});

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: "images",
  allowedFormats: ["jpg", "png"],
  transformation: [{width: 500, height: 500, crop: "limit"}]
});
const parser = multer({storage: storage});

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

routes(app);

app.listen(localPort);
console.log("server runnig locally on port ", localPort);
