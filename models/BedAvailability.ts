import mongoose from 'mongoose';

const bedAvailabilitySchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  generalBeds: {
    total: { type: Number, required: true },
    available: { type: Number, required: true },
  },
  icuBeds: {
    total: { type: Number, required: true },
    available: { type: Number, required: true },
  },
}, { timestamps: true });

export default mongoose.models.BedAvailability || mongoose.model('BedAvailability', bedAvailabilitySchema);