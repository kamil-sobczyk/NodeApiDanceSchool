const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const Schema = mongoose.Schema;
const articleSchema = require('./data/models/article');
const express = require('express');
const app = express();
const mongoUrl =
  'mongodb://mo1097_happy:Happy1@mongo40.mydevil.net:27017/mo1097_happy';

// cloudinary.config({
//   cloud_name: process.env.cloudName,
//   api_key: process.env.apiKey,
//   api_secret: process.env.apiSecret
// });

// const storage = cloudinaryStorage({
//   cloudinary: cloudinary,
//   folder: "images",
//   allowedFormats: ["jpg", "png"],
//   transformation: [{width: 500, height: 500, crop: "limit"}]
// });
// const parser = multer({storage: storage});

const url = mongoUrl;

// mongoose.connect(url);

// const Item = new ItemSchema({img: {data: Buffer, contentType: String}});
// const Item = mongoose.model('Images', ItemSchema);

// app.use(
//   multer({
//     dest: './uploads/',
//     rename: function(fieldname, filename) {
//       return filename;
//     }
//   })
// );

const appRouter = app => {
  app.all('/*', (req, res, next) => {
    mongoose.connect(url, {
      useNewUrlParser: true
    });
    const db = mongoose.connection;
    const articleModel = mongoose.model('articles', articleSchema);
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
      res.news = articleModel;
      res.db = db;
      next();
    });
    db.on('close', () => {
      mongoose.disconnect();
      db.removeAllListeners();
    });
    db.on('disconnected', () => {
      console.log('Mongoose default connection is disconnected');
    });
    process.on('SIGINT', () => {
      db.close(() => {
        console.log(
          'Mongoose default connection is disconnected due to application termination'
        );
        process.exit(0);
      });
    });
    process.setMaxListeners(0);
  });

  app
    .route('/news')
    .get((req, res) => {
      const news = res.news;

      if (!news) {
        const newNews = new articles({
          header: '',
          content: '',
          date: ''
        });
        newNews.save(err => {
          if (err) return handleError(err);
        });
        res.status(200).send(newNews);
      } else {
        news.exec((err, resp) => {
          if (err) {
            console.log('error ', err);
            res.status(500);
            return;
          }
          res.status(200).send(res.news);
        });
      }
    })
    .post((req, res) => {
      const news = res.news;
      console.log('req', req.body);
      const {newPost} = req.body;
      news
        .findOneAndUpdate({$push: {news: newPost}}, {useFindAndModify: false})
        .exec((err, resp) => {
          if (err) {
            console.log('error ', err);
            res.status(500);
            return;
          }
        });

      res.status(200).send({});
    })
    .put((req, res) => {})
    .delete((req, res) => {});

  app.route('/api/images').post((req, res) => {
    const newItem = new Item();
    newItem.img.data = fs.readFileSync(req.files.userPhoto.path);
    newItem.img.contentType = 'image/png';
    newItem.save();
  });
};

module.exports = appRouter;
