import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  experience: { type: Number, required: true },
  qualification: { type: String, required: true },
  consultationFee: { type: Number, required: true },
  availableSlots: [{ type: String }], // e.g., ['09:00', '10:00', '11:00']
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);