import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['appointment', 'general'], default: 'general' },
  read: { type: Boolean, default: false },
  data: { type: mongoose.Schema.Types.Mixed }, // Additional data
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);