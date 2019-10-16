const mongoose = require("mongoose");
const articleSchema = require("./data/models/article");
const {mongoUrl} = require("./config");

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
};

module.exports = appRouter;
