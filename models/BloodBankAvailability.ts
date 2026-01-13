import mongoose from 'mongoose';

const bloodBankAvailabilitySchema = new mongoose.Schema({
  state: { type: String, required: true },
  district: { type: String, required: true },
  bloodBankName: { type: String, required: true },
  category: { type: String }, // Govt/Private/Red Cross
  address: { type: String },
  contactNumber: { type: String },
  bloodGroups: {
    'A+': { type: Number, default: 0 },
    'A-': { type: Number, default: 0 },
    'B+': { type: Number, default: 0 },
    'B-': { type: Number, default: 0 },
    'O+': { type: Number, default: 0 },
    'O-': { type: Number, default: 0 },
    'AB+': { type: Number, default: 0 },
    'AB-': { type: Number, default: 0 },
  },
  lastUpdated: { type: Date, default: Date.now },
  source: { type: String, default: 'eRaktKosh' },
}, { timestamps: true });

bloodBankAvailabilitySchema.index({ district: 1, bloodBankName: 1 }, { unique: true });

export default mongoose.models.BloodBankAvailability || mongoose.model('BloodBankAvailability', bloodBankAvailabilitySchema);