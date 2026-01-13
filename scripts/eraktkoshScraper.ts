import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital-management';

const bloodBankAvailabilitySchema = new mongoose.Schema({
  state: String,
  district: String,
  bloodBankName: String,
  category: String,
  address: String,
  contactNumber: String,
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

const BloodBankAvailability = mongoose.model('BloodBankAvailability', bloodBankAvailabilitySchema);

async function createMockBloodBankData() {
  console.log('🩸 Creating blood bank availability data...');
  
  const mockData = [
    {
      state: 'Andhra Pradesh',
      district: 'Kadapa',
      bloodBankName: 'Government General Hospital Blood Bank Kadapa',
      category: 'Government',
      address: 'Hospital Road, Kadapa - 516001, Andhra Pradesh',
      contactNumber: '+91 8562-228855',
      bloodGroups: { 'A+': 25, 'A-': 8, 'B+': 30, 'B-': 5, 'O+': 45, 'O-': 12, 'AB+': 15, 'AB-': 3 }
    },
    {
      state: 'Andhra Pradesh',
      district: 'Anantapur',
      bloodBankName: 'District Hospital Blood Bank Anantapur',
      category: 'Government',
      address: 'Anantapur District Hospital, Anantapur - 515001, Andhra Pradesh',
      contactNumber: '+91 8554-255566',
      bloodGroups: { 'A+': 20, 'A-': 6, 'B+': 25, 'B-': 4, 'O+': 40, 'O-': 10, 'AB+': 12, 'AB-': 2 }
    },
    {
      state: 'Andhra Pradesh',
      district: 'Kurnool',
      bloodBankName: 'Kurnool Medical College Blood Bank',
      category: 'Government',
      address: 'Medical College Road, Kurnool - 518002, Andhra Pradesh',
      contactNumber: '+91 8518-255777',
      bloodGroups: { 'A+': 35, 'A-': 10, 'B+': 28, 'B-': 7, 'O+': 50, 'O-': 15, 'AB+': 18, 'AB-': 5 }
    },
    {
      state: 'Telangana',
      district: 'Hyderabad',
      bloodBankName: 'Gandhi Hospital Blood Bank',
      category: 'Government',
      address: 'Secunderabad, Hyderabad - 500003, Telangana',
      contactNumber: '+91 40-27560146',
      bloodGroups: { 'A+': 60, 'A-': 20, 'B+': 55, 'B-': 15, 'O+': 80, 'O-': 25, 'AB+': 30, 'AB-': 8 }
    },
    {
      state: 'Telangana',
      district: 'Hyderabad',
      bloodBankName: 'Osmania General Hospital Blood Bank',
      category: 'Government',
      address: 'Afzal Gunj, Hyderabad - 500012, Telangana',
      contactNumber: '+91 40-24600146',
      bloodGroups: { 'A+': 45, 'A-': 15, 'B+': 40, 'B-': 12, 'O+': 65, 'O-': 20, 'AB+': 25, 'AB-': 6 }
    },
    {
      state: 'Andhra Pradesh',
      district: 'Visakhapatnam',
      bloodBankName: 'King George Hospital Blood Bank',
      category: 'Government',
      address: 'Maharanipeta, Visakhapatnam - 530002, Andhra Pradesh',
      contactNumber: '+91 891-2568123',
      bloodGroups: { 'A+': 38, 'A-': 12, 'B+': 32, 'B-': 8, 'O+': 55, 'O-': 18, 'AB+': 22, 'AB-': 4 }
    },
    {
      state: 'Andhra Pradesh',
      district: 'Vijayawada',
      bloodBankName: 'Government General Hospital Blood Bank Vijayawada',
      category: 'Government',
      address: 'Hospital Road, Vijayawada - 520001, Andhra Pradesh',
      contactNumber: '+91 866-2578901',
      bloodGroups: { 'A+': 42, 'A-': 14, 'B+': 36, 'B-': 9, 'O+': 58, 'O-': 16, 'AB+': 20, 'AB-': 5 }
    },
    {
      state: 'Telangana',
      district: 'Warangal',
      bloodBankName: 'MGM Hospital Blood Bank Warangal',
      category: 'Government',
      address: 'Warangal - 506002, Telangana',
      contactNumber: '+91 870-2459876',
      bloodGroups: { 'A+': 28, 'A-': 9, 'B+': 24, 'B-': 6, 'O+': 35, 'O-': 11, 'AB+': 16, 'AB-': 3 }
    },
    {
      state: 'Andhra Pradesh',
      district: 'Nellore',
      bloodBankName: 'Government Medical College Blood Bank Nellore',
      category: 'Government',
      address: 'Medical College Road, Nellore - 524001, Andhra Pradesh',
      contactNumber: '+91 861-2356789',
      bloodGroups: { 'A+': 22, 'A-': 7, 'B+': 26, 'B-': 5, 'O+': 42, 'O-': 14, 'AB+': 14, 'AB-': 3 }
    },
    {
      state: 'Andhra Pradesh',
      district: 'Ongole',
      bloodBankName: 'Government General Hospital Blood Bank Ongole',
      category: 'Government',
      address: 'Hospital Lane, Ongole - 523001, Andhra Pradesh',
      contactNumber: '+91 858-2123456',
      bloodGroups: { 'A+': 18, 'A-': 5, 'B+': 20, 'B-': 4, 'O+': 30, 'O-': 8, 'AB+': 10, 'AB-': 2 }
    },
    {
      state: 'Telangana',
      district: 'Hyderabad',
      bloodBankName: 'Nizamia Hospital Blood Bank',
      category: 'Government',
      address: 'Charminar Road, Hyderabad - 500002, Telangana',
      contactNumber: '+91 40-24601234',
      bloodGroups: { 'A+': 50, 'A-': 18, 'B+': 48, 'B-': 13, 'O+': 70, 'O-': 22, 'AB+': 28, 'AB-': 7 }
    },
    {
      state: 'Telangana',
      district: 'Hyderabad',
      bloodBankName: 'CARE Hospital Blood Bank Hyderabad',
      category: 'Private',
      address: 'Banjara Hills, Hyderabad - 500034, Telangana',
      contactNumber: '+91 40-23456789',
      bloodGroups: { 'A+': 35, 'A-': 11, 'B+': 32, 'B-': 8, 'O+': 48, 'O-': 14, 'AB+': 18, 'AB-': 4 }
    }
  ];

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📊 Connected to MongoDB');
    
    for (const bank of mockData) {
      await BloodBankAvailability.findOneAndUpdate(
        {
          district: bank.district,
          bloodBankName: bank.bloodBankName
        },
        {
          ...bank,
          lastUpdated: new Date(),
          source: 'Government Data'
        },
        { upsert: true, new: true }
      );
    }
    
    console.log(`✅ Created ${mockData.length} blood bank records`);
    console.log('🩸 Blood bank data populated successfully!');
    
  } catch (error) {
    console.error('❌ Error creating blood bank data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createMockBloodBankData();