import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: String,
  text: String,
  link: String,
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace'
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});
schema.index({
  recipient: 1,
  createdAt: -1
});
export default mongoose.model('Notification', schema);
