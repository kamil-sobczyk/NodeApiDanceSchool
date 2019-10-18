const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");
const articleSchema = require("./data/models/article");
const {mongoUrl} = require("./config");

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

const url = mongoUrl;

const appRouter = app => {
  app.all("/*", (req, res, next) => {
    mongoose.connect(url, {
      useNewUrlParser: true
    });
    const db = mongoose.connection;
    const articleModel = mongoose.model("articles", articleSchema);
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", () => {
      res.articles = articleModel;
      res.db = db;
      next();
    });
    db.on("close", () => {
      mongoose.disconnect();
      db.removeAllListeners();
    });
    db.on("disconnected", () => {
      console.log("Mongoose default connection is disconnected");
    });
    process.on("SIGINT", () => {
      db.close(() => {
        console.log(
          "Mongoose default connection is disconnected due to application termination"
        );
        process.exit(0);
      });
    });
    process.setMaxListeners(0);
  });

  app
    .route("/aricles")
    .get((req, res) => {
      const articles = res.articles;
    })
    .post((req, res) => {
      res.status(200).send({});
    })
    .put((req, res) => {})
    .delete((req, res) => {});

  app.route("/api/images", parser.single("image")).post((req, res) => {
    console.log(req.file); // to see what is returned to you
    const image = {};
    image.url = req.file.url;
    image.id = req.file.public_id;
    Image.create(image) // save image information in database
      .then(newImage => res.json(newImage))
      .catch(err => console.log(err));
  });
};

module.exports = appRouter;
