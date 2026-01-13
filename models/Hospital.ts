import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  description: { type: String },
  specialties: [{ type: String }],
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  city: { type: String }, // Added for filtering
}, { timestamps: true });

export default mongoose.models.Hospital || mongoose.model('Hospital', hospitalSchema);