import mongoose from 'mongoose';

const bloodInventorySchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'], required: true },
  units: { type: Number, required: true, min: 0 },
}, { timestamps: true });

bloodInventorySchema.index({ hospitalId: 1, bloodType: 1 }, { unique: true });

export default mongoose.models.BloodInventory || mongoose.model('BloodInventory', bloodInventorySchema);