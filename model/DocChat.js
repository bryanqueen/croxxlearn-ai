import mongoose from 'mongoose';

const SummarySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  keyPoints: [{ type: String, required: true }]
});

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const DocChatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fullText: { type: String, required: true },
  summaries: [SummarySchema],
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

DocChatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.DocChat || mongoose.model('DocChat', DocChatSchema);