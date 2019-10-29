const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  usr: String,
  news: Array
});

module.exports = adminSchema;
