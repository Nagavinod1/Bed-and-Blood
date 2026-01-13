const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital-management';

// Define schemas directly in seed file
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['patient', 'hospital'] },
  phone: String,
  address: String,
}, { timestamps: true });

const hospitalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  address: String,
  phone: String,
  email: String,
  description: String,
  specialties: [String],
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  city: String,
}, { timestamps: true });

const doctorSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  name: String,
  specialization: String,
  experience: Number,
  qualification: String,
  consultationFee: Number,
  availableSlots: [String],
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  appointmentDate: Date,
  timeSlot: String,
  status: { type: String, enum: ['pending', 'confirmed', 'rejected', 'completed'], default: 'pending' },
  symptoms: String,
  notes: String,
}, { timestamps: true });

const bedAvailabilitySchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  generalBeds: {
    total: Number,
    available: Number,
  },
  icuBeds: {
    total: Number,
    available: Number,
  },
}, { timestamps: true });

const bloodInventorySchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
  units: { type: Number, min: 0 },
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  response: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Hospital = mongoose.model('Hospital', hospitalSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const BedAvailability = mongoose.model('BedAvailability', bedAvailabilitySchema);
const BloodInventory = mongoose.model('BloodInventory', bloodInventorySchema);
const Review = mongoose.model('Review', reviewSchema);

// AP/Telangana specific hospital names with realistic details
const hospitalData = [
  {
    name: 'RIMS Government Hospital Kadapa',
    city: 'Kadapa',
    state: 'Andhra Pradesh',
    address: 'Rajiv Gandhi Institute of Medical Sciences, Kadapa - 516003, Andhra Pradesh',
    phone: '+91 8562-228855',
    email: 'rims.kadapa@ap.gov.in',
    description: 'Premier government medical college and hospital serving Rayalaseema region with 24/7 emergency services, advanced cardiac care, and multi-specialty treatments.'
  },
  {
    name: 'Government General Hospital Anantapur',
    city: 'Anantapur', 
    state: 'Andhra Pradesh',
    address: 'Hospital Road, Anantapur - 515001, Andhra Pradesh',
    phone: '+91 8554-255566',
    email: 'ggh.anantapur@ap.gov.in',
    description: 'District headquarters hospital providing comprehensive healthcare services including maternity care, pediatrics, and emergency medical services to Anantapur district.'
  },
  {
    name: 'Kurnool Medical College Hospital',
    city: 'Kurnool',
    state: 'Andhra Pradesh', 
    address: 'Medical College Road, Kurnool - 518002, Andhra Pradesh',
    phone: '+91 8518-255777',
    email: 'kmc.kurnool@ap.gov.in',
    description: 'Government medical college hospital with super-specialty departments, trauma center, and teaching hospital facilities serving North Andhra Pradesh.'
  },
  {
    name: 'Gandhi Hospital Secunderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'Gandhi Hospital Road, Secunderabad - 500003, Telangana',
    phone: '+91 40-27560146',
    email: 'gandhi.hospital@telangana.gov.in',
    description: 'Major government hospital in Hyderabad with advanced medical facilities, ICU care, and specialized departments for cardiac, neuro, and orthopedic treatments.'
  },
  {
    name: 'Osmania General Hospital',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'Afzal Gunj, Hyderabad - 500012, Telangana', 
    phone: '+91 40-24600146',
    email: 'osmania.hospital@telangana.gov.in',
    description: 'Historic government hospital and medical college with comprehensive healthcare services, trauma center, and postgraduate medical education facilities.'
  },
  {
    name: 'Government General Hospital Warangal',
    city: 'Warangal',
    state: 'Telangana',
    address: 'Station Road, Warangal - 506002, Telangana',
    phone: '+91 870-2459876', 
    email: 'ggh.warangal@telangana.gov.in',
    description: 'District hospital serving North Telangana with modern medical equipment, maternity services, and 24/7 emergency care.'
  },
  {
    name: 'Government General Hospital Vijayawada',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    address: 'Hospital Road, Governorpet, Vijayawada - 520002, Andhra Pradesh',
    phone: '+91 866-2578901',
    email: 'ggh.vijayawada@ap.gov.in', 
    description: 'Major government hospital in Krishna district with advanced diagnostic facilities, surgical departments, and emergency medical services.'
  },
  {
    name: 'King George Hospital Visakhapatnam',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    address: 'Maharanipeta, Visakhapatnam - 530002, Andhra Pradesh',
    phone: '+91 891-2568123',
    email: 'kgh.visakhapatnam@ap.gov.in',
    description: 'Premier coastal Andhra hospital with marine medicine expertise, trauma center, and comprehensive healthcare services for North Andhra Pradesh.'
  },
  {
    name: 'Nizamia Hospital Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'Charminar Road, Hyderabad - 500002, Telangana',
    phone: '+91 40-24601234',
    email: 'nizamia.hospital@telangana.gov.in',
    description: 'Historic government hospital with state-of-the-art facilities, specialized departments, and round-the-clock emergency services.'
  },
  {
    name: 'Government Medical College Hospital Nellore',
    city: 'Nellore',
    state: 'Andhra Pradesh',
    address: 'Medical College Road, Nellore - 524001, Andhra Pradesh',
    phone: '+91 861-2356789',
    email: 'gmc.nellore@ap.gov.in',
    description: 'Modern government medical college hospital with comprehensive facilities for general and specialized treatment in South Andhra Pradesh.'
  },
  {
    name: 'Government General Hospital Ongole',
    city: 'Ongole',
    state: 'Andhra Pradesh',
    address: 'Hospital Lane, Ongole - 523001, Andhra Pradesh',
    phone: '+91 858-2123456',
    email: 'ggh.ongole@ap.gov.in',
    description: 'District hospital providing essential healthcare services with advanced diagnostic and surgical facilities for Prakasam district.'
  },
  {
    name: 'CARE Hospital Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'Banjara Hills, Hyderabad - 500034, Telangana',
    phone: '+91 40-23456789',
    email: 'care.hyderabad@hospitals.com',
    description: 'Multi-specialty private hospital with modern infrastructure, experienced doctors, and comprehensive healthcare services in Hyderabad.'
  }
];

const cities = hospitalData.map(h => h.city);
const hospitalNames = hospitalData.map(h => h.name);

// AP/Telangana doctor names with realistic regional names
const doctorNames = [
  'Dr. Venkata Ramana Reddy', 'Dr. Lakshmi Prasanna', 'Dr. Srinivasa Rao Chowdary', 'Dr. Padmavathi Devi',
  'Dr. Rajesh Kumar Naidu', 'Dr. Sunitha Reddy', 'Dr. Narasimha Rao Goud', 'Dr. Kavitha Sharma',
  'Dr. Ravi Teja Varma', 'Dr. Priya Kumari', 'Dr. Suresh Babu Raju', 'Dr. Madhavi Latha',
  'Dr. Kiran Kumar Yadav', 'Dr. Swathi Reddy Gari', 'Dr. Mahesh Chandra Rao', 'Dr. Divya Sri Devi',
  'Dr. Ramesh Naidu Kota', 'Dr. Sailaja Devi Patel', 'Dr. Prakash Rao Bandaru', 'Dr. Anitha Kumari Joshi',
  'Dr. Venkateswara Rao', 'Dr. Bharathi Devi', 'Dr. Mohan Krishna', 'Dr. Vasantha Lakshmi'
];

// AP/Telangana patient names with authentic regional names
const patientNames = [
  'Ravi Kumar Reddy', 'Lakshmi Devi Patel', 'Suresh Reddy Goud', 'Padma Kumari Naidu', 'Venkat Rao Chowdary',
  'Sita Mahalakshmi Devi', 'Krishna Murthy Varma', 'Radha Devi Sharma', 'Ramesh Babu Raju', 'Saroja Devi Yadav',
  'Naresh Kumar Bandaru', 'Vijaya Lakshmi Kota', 'Mahesh Reddy Gari', 'Kamala Devi Joshi', 'Rajesh Naidu Patel',
  'Srinivas Rao Chowdary', 'Bharathi Devi Reddy', 'Mohan Krishna Varma', 'Vasantha Lakshmi', 'Prakash Rao Goud'
];

const specializations = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Oncology', 'Gastroenterology', 'Psychiatry'];
const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Hospital.deleteMany({}),
      Doctor.deleteMany({}),
      Appointment.deleteMany({}),
      BedAvailability.deleteMany({}),
      BloodInventory.deleteMany({}),
      Review.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create 20 patient users with realistic AP/Telangana names
    const patients = await User.insertMany(
      patientNames.map((name, i) => ({
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '').replace('dr.', '')}@gmail.com`,
        password: hashedPassword,
        role: 'patient',
        phone: `+91 ${9000000000 + Math.floor(Math.random() * 999999999)}`,
        address: `${100 + i}-${Math.floor(Math.random() * 999) + 1}, ${[
          'Gandhi Nagar', 'Nehru Colony', 'Indira Nagar', 'Rajiv Colony', 'Ambedkar Nagar',
          'Vivekananda Colony', 'Subhash Nagar', 'Tilak Road', 'MG Road', 'Station Road',
          'Hospital Road', 'Market Street', 'Temple Street', 'Park Road', 'Main Bazaar'
        ][i % 15]}, ${cities[i % cities.length]}, ${hospitalData[i % hospitalData.length].state} - ${516001 + i}`
      }))
    );

    // Create 5 hospital admin users
    const hospitalNames = [
      'City General Hospital',
      'Metro Medical Center', 
      'Central Health Institute',
      'Regional Medical Hospital',
      'Community Care Center'
    ];

    // Create 8 hospital admin users
    const hospitalAdmins = await User.insertMany(
      hospitalData.map((hospital, i) => ({
        name: `${hospital.name} Administrator`,
        email: hospital.email,
        password: hashedPassword,
        role: 'hospital',
        phone: hospital.phone,
        address: hospital.address
      }))
    );

    // Create 8 hospitals with authentic details
    const hospitals = await Hospital.insertMany(
      hospitalData.map((hospital, i) => ({
        userId: hospitalAdmins[i]._id,
        name: hospital.name,
        address: hospital.address,
        phone: hospital.phone,
        email: hospital.email,
        description: hospital.description,
        specialties: specializations.slice(i % 4, (i % 4) + 4),
        rating: 3.8 + Math.random() * 1.2,
        totalReviews: Math.floor(Math.random() * 150) + 50,
        city: hospital.city
      }))
    );

    // Create 24 doctors (3 per hospital) with realistic AP/Telangana names and qualifications
    const qualifications = [
      'MBBS, MD (General Medicine)', 'MBBS, MS (General Surgery)', 'MBBS, MD (Pediatrics)', 
      'MBBS, DM (Cardiology)', 'MBBS, MCh (Neurosurgery)', 'MBBS, MD (Dermatology)',
      'MBBS, MD (Psychiatry)', 'MBBS, MD (Orthopedics)'
    ];
    
    const doctors = [];
    for (let i = 0; i < hospitals.length; i++) {
      for (let j = 0; j < 3; j++) {
        const doctorIndex = i * 3 + j;
        const experience = Math.floor(Math.random() * 20) + 5;
        const consultationFee = Math.floor(Math.random() * 300) + 200;
        
        doctors.push({
          hospitalId: hospitals[i]._id,
          name: doctorNames[doctorIndex % doctorNames.length],
          specialization: specializations[j % specializations.length],
          experience,
          qualification: qualifications[j % qualifications.length],
          consultationFee,
          availableSlots: [
            '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'
          ].slice(0, 3 + Math.floor(Math.random() * 3)),
          isAvailable: true
        });
      }
    }
    const createdDoctors = await Doctor.insertMany(doctors);

    // Create bed availability for all hospitals
    const bedData = hospitals.map(hospital => ({
      hospitalId: hospital._id,
      generalBeds: {
        total: Math.floor(Math.random() * 100) + 50,
        available: Math.floor(Math.random() * 30) + 10
      },
      icuBeds: {
        total: Math.floor(Math.random() * 20) + 10,
        available: Math.floor(Math.random() * 8) + 2
      }
    }));
    await BedAvailability.insertMany(bedData);

    // Create blood inventory for all hospitals
    const bloodData = [];
    hospitals.forEach(hospital => {
      bloodTypes.forEach(bloodType => {
        bloodData.push({
          hospitalId: hospital._id,
          bloodType,
          units: Math.floor(Math.random() * 50) + 5
        });
      });
    });
    await BloodInventory.insertMany(bloodData);

    // Create sample appointments
    const appointments = [];
    for (let i = 0; i < 25; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const hospital = hospitals[Math.floor(Math.random() * hospitals.length)];
      const doctor = createdDoctors.find(d => d.hospitalId.toString() === hospital._id.toString());
      
      if (doctor) {
        const date = new Date();
        date.setDate(date.getDate() + Math.floor(Math.random() * 30) - 15);
        
        appointments.push({
          patientId: patient._id,
          hospitalId: hospital._id,
          doctorId: doctor._id,
          appointmentDate: date,
          timeSlot: doctor.availableSlots[Math.floor(Math.random() * doctor.availableSlots.length)],
          status: ['pending', 'confirmed', 'completed', 'rejected'][Math.floor(Math.random() * 4)],
          symptoms: [
            'జ్వరం మరియు తలనొప్పి (Fever and headache)', 
            'ఛాతీ నొప్పి (Chest pain)', 
            'వెన్ను నొప్పి (Back pain)', 
            'సాధారణ చెకప్ (Regular checkup)', 
            'కడుపు నొప్పి (Stomach ache)',
            'మోకాలి నొప్పి (Knee pain)',
            'కళ్ళ సమస్య (Eye problem)',
            'చర్మ సమస్య (Skin problem)'
          ][Math.floor(Math.random() * 8)]
        });
      }
    }
    await Appointment.insertMany(appointments);

    // Create sample reviews
    const reviews = [];
    for (let i = 0; i < 20; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const hospital = hospitals[Math.floor(Math.random() * hospitals.length)];
      
      reviews.push({
        patientId: patient._id,
        hospitalId: hospital._id,
        rating: Math.floor(Math.random() * 5) + 1,
        comment: [
          'అద్భుతమైన సేవ మరియు వృత్తిపరులు సిబ్బంది (Excellent service and professional staff)',
          'మంచి సౌకర్యాలు కానీ ఎక్కువ వేచింగు సమయం (Good facilities but long waiting time)',
          'చికిత్సలో చాలా సంతోషంగా ఉన్నాను (Very satisfied with the treatment)',
          'సఫాయి వాతావరణం మరియు సౌహార్ద డాక్టర్లు (Clean environment and friendly doctors)',
          'అపాయింట్మెంట్ వ్యవస్థను మెరుగుపరచవచ్చు (Could improve appointment scheduling)',
          'Hospital staff is very cooperative and helpful',
          'Doctors are experienced and caring',
          'Good medical facilities available here'
        ][Math.floor(Math.random() * 8)]
      });
    }
    await Review.insertMany(reviews);

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Data Summary:');
    console.log(`👥 Users: ${patients.length} patients + ${hospitalAdmins.length} hospital admins`);
    console.log(`🏥 Hospitals: ${hospitals.length} hospitals`);
    console.log(`👨‍⚕️ Doctors: ${createdDoctors.length} doctors`);
    console.log(`📅 Appointments: ${appointments.length} appointments`);
    console.log(`⭐ Reviews: ${reviews.length} reviews`);
    console.log(`🛏️ Bed data for all hospitals`);
    console.log(`🩸 Blood inventory for all hospitals`);
    
    console.log('\n🔑 Sample Login Credentials:');
    console.log('Patient: ravikumarreddy@gmail.com / password123');
    console.log('Hospital Admin: rims.kadapa@ap.gov.in / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

seedDatabase();