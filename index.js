const express = require('express');
const app = express();
const fs = require('fs');

const mongoose = require('mongoose');
const adminSchema = require('./data/models/admin');
const url =
  'mongodb://mo1185_happy:Biurohappyfiit12@mongo44.mydevil.net:27017/mo1185_happy';

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage }).array('file');

const publicDir = require('path').join(__dirname, '/public');
app.use(express.static(publicDir));

const appRouter = app => {
  app.all('/*', (req, res, next) => {
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    const db = mongoose.connection;
    const adminModel = mongoose.model('admin', adminSchema);
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
      res.admin = adminModel;
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
      const admin = res.admin;

      admin.findOne({ usr: 'happyfiit' }).exec((err, resp) => {
        if (err) {
          console.log('error ', err);
          res.status(500);
          return;
        }
        if (!resp) {
          console.log('!admin');
          const newAdmin = new admin({
            usr: 'happyfiit',
            news: []
          });
          newAdmin.save(err => {
            if (err) return handleError(err);
          });
          res.status(200).send(newAdmin);
        } else {
          res.status(200).send(resp);
        }
      });
    })
    .post((req, res) => {
      const admin = res.admin;
      const { newPost } = req.body;
      console.log('newpost', JSON.stringify(newPost));
      admin
        .findOneAndUpdate(
          { usr: 'happyfiit' },
          { $push: { news: newPost } },
          { useFindAndModify: false }
        )
        .exec((err, resp) => {
          if (err) {
            console.log('error ', err);
            res.status(500);
            return;
          }
        });

      res.status(200).send({});
    })
    .put((req, res) => {
      const admin = res.admin;
      const { oldPost, newPost } = req.body;

      console.log('oldPost', oldPost);
      console.log('newPost', newPost);

      admin.updateOne(
        { usr: 'happyfiit', 'news.header': oldPost.header },
        {
          $set: {
            'news.$.header': newPost.header,
            'news.$.content': newPost.content,
            'news.$.date': newPost.date
          }
        },
        (err, data) => {
          if (err) {
            console.log('error ', err);
            res.status(500);
            return;
          }
        }
      );
      res.status(200).send({});
    })
    .delete((req, res) => {
      const admin = res.admin;
      const { postToDelete } = req.body;

      console.log('delete - req-body', req.body);
      console.log('delete - post to delete', postToDelete);

      admin
        .updateOne(
          { usr: 'happyfiit' },
          {
            $pull: {
              news: {
                header: postToDelete.header,
                date: postToDelete.date
              }
            }
          }
        )
        .exec((err, resp) => {
          if (err) {
            console.log('error ', err);
            res.status(500);
            return;
          }
        });
      res.status(200).send({});
    });
  app
    .route('/upload')
    .post((req, res) => {
      console.log('req', req);
      upload(req, res, function(err) {
        console.log('req.file', req.file);
        if (err instanceof multer.MulterError) {
          console.log('instance', err);
          return res.status(500).json(err);
        } else if (err) {
          console.log('err', err);
          return res.status(500).json(err);
        }
        // console.log('req oldname', req);

        console.log('req', req.files);
        return res.status(200).send(req.files);
      });
    })
    .get((req, res) => {
      const date = req.query.date;
      // console.log('req.pa', req.query.date);
      fs.readFile(`public/${date}.jpg`, function(err, data) {
        if (err) throw err; // Fail if the file can't be read.
        var contentType = 'image/png';
        var base64 = Buffer.from(data).toString('base64');
        base64 = 'data:image/png;base64,' + base64;
        res.send(base64);
      });
    });
};

module.exports = appRouter;
