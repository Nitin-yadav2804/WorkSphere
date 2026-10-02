import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  key: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});
export default mongoose.model('Conversation', schema);
