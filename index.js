const mongoose = require('mongoose');
const adminSchema = require('./data/models/admin');
const url =
  'mongodb://mo1097_happy:Happy1@mongo40.mydevil.net:27017/mo1097_happy';

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

      admin.findOne({usr: 'happyfiit'}).exec((err, resp) => {
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
      const {newPost} = req.body;
      admin
        .findOneAndUpdate(
          {usr: 'happyfiit'},
          {$push: {news: newPost}},
          {useFindAndModify: false}
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
      const {oldPost, newPost} = req.body;

      console.log(oldPost);
      console.log(newPost);

      admin.updateOne(
        {usr: 'happyfiit', 'news.header': oldPost.header},
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
      const {postToDelete} = req.body;

      console.log(req.body);
      console.log(postToDelete);

      admin
        .updateOne(
          {usr: 'happyfiit'},
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
};

module.exports = appRouter;
