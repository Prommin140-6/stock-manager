const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: String,
  quantity: { type: Number, required: true },
  image: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);