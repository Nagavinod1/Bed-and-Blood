import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  response: { type: String }, // Hospital's response
}, { timestamps: true });

export default mongoose.models.Review || mongoose.model('Review', reviewSchema);