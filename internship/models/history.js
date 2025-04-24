import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: ['add', 'remove', 'edit'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  requester: {
    type: String,
    required: true, // บังคับให้มีชื่อผู้เบิก
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.History || mongoose.model('History', HistorySchema);