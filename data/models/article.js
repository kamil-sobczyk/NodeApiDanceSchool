const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  header: String,
  subheader: String,
  content: String,
  footer: String,
  pic: String,
  date: String
});

module.exports = articleSchema;
