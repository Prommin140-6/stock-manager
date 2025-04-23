const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  itemName: { type: String, required: true },
  action: { type: String, enum: ['add', 'remove'], required: true },
  quantity: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History', historySchema);