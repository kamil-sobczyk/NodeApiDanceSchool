const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  header: String,
  content: String,
  date: String
});

module.exports = articleSchema;
