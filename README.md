# Hospital Management System

A complete full-stack Hospital Management System built with Next.js, TypeScript, Tailwind CSS, MongoDB, and JWT authentication.

## 🚀 Features

### Patient Features
- **Authentication**: Secure signup/login with JWT
- **Hospital Search**: Advanced search with city, specialization filters
- **Hospital Details**: View doctors, bed availability, blood inventory
- **Appointment Booking**: Book appointments with available doctors
- **Appointment History**: Track all appointments and their status
- **Reviews & Ratings**: Rate and review hospitals
- **PDF Receipts**: Download appointment receipts
- **Notifications**: Real-time appointment status updates

### Hospital Admin Features
- **Hospital Profile**: Create and manage hospital information
- **Doctor Management**: Add and manage doctors with specializations
- **Bed Management**: Update bed availability (General/ICU)
- **Blood Inventory**: Manage blood bank inventory by type
- **Appointment Management**: View, confirm, reject, and complete appointments
- **Advanced Filters**: Filter appointments by date, status, patient name
- **Dashboard Analytics**: View statistics and recent activities
- **PDF Reports**: Export appointment reports
- **Notifications**: Get notified of new bookings

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod schema validation
- **PDF Generation**: jsPDF
- **UI Components**: Lucide React Icons
- **Notifications**: React Hot Toast + MongoDB notifications

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hospital-management-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/hospital-management
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure
NEXTAUTH_URL=http://localhost:3000
```

### 4. Start MongoDB
If using local MongoDB:
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

### 5. Seed Database (Important)
```bash
npm run seed
```

### 6. Run the Application
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📊 Sample Data

After running `npm run seed`, you'll have:
- **5 Hospitals** with full details and specializations
- **20 Doctors** mapped to hospitals
- **15 Patient accounts**
- **25 Sample appointments** with various statuses
- **20 Reviews** for hospitals
- **Bed availability** for all hospitals
- **Blood inventory** for all blood types

### Sample Login Credentials:
- **Patient**: patient1@test.com / password123
- **Hospital Admin**: admin1@hospital.com / password123

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Hospitals
- `GET /api/hospitals/search` - Search hospitals with filters
- `GET /api/hospitals/[id]` - Get hospital details
- `GET /api/hospitals/profile` - Get hospital profile (admin)
- `POST /api/hospitals/profile` - Update hospital profile (admin)

### Appointments
- `GET /api/appointments` - Get appointments with filters
- `POST /api/appointments` - Book new appointment
- `PATCH /api/appointments/[id]` - Update appointment status

### Reports & PDF
- `GET /api/reports?type=patient&appointmentId=X` - Download receipt
- `GET /api/reports?type=hospital` - Download appointments report

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications` - Mark as read

## 🎯 Advanced Features

### 1. Advanced Search & Filters
- Filter hospitals by city and specialization
- Sort by name or rating
- Filter appointments by date, status, patient name

### 2. PDF Export System
- Patients can download appointment receipts
- Hospital admins can export appointment reports

### 3. Notifications System
- Real-time notifications for appointment updates
- MongoDB-based notification storage
- Toast notifications in UI

### 4. Analytics Dashboard
- Total appointments, pending, completed counts
- Doctor and patient statistics
- Recent activity tracking

### 5. Security Features
- Input validation with Zod schemas
- JWT token authentication
- Password hashing with bcrypt
- Protected API routes

## 🚀 Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hospital-management
JWT_SECRET=your-production-jwt-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
```

## 🧪 Testing Workflow

1. Run `npm run seed` to populate database
2. Register as hospital admin (admin1@hospital.com)
3. Complete hospital profile and add doctors
4. Register as patient (patient1@test.com)
5. Search hospitals and book appointments
6. Test appointment management flow
7. Download PDF receipts and reports
8. Test notification system

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database with sample data
```

## 📁 Project Structure

```
hospital-management-system/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication
│   │   ├── hospitals/         # Hospital management
│   │   ├── doctors/           # Doctor management
│   │   ├── appointments/      # Appointments
│   │   ├── notifications/     # Notifications
│   │   └── reports/           # PDF generation
│   ├── auth/                  # Auth pages
│   ├── dashboard/             # Dashboards
│   ├── hospitals/             # Hospital pages
│   ├── error.tsx              # Error page
│   ├── not-found.tsx          # 404 page
│   └── layout.tsx             # Root layout
├── components/
│   └── Navbar.tsx             # Navigation
├── lib/
│   ├── db.ts                  # Database connection
│   ├── jwt.ts                 # JWT utilities
│   └── validation.ts          # Zod schemas
├── models/                    # Mongoose models
└── seed.js                    # Database seeding
```

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Verify MongoDB is running
- Check connection string in `.env.local`
- Ensure network access for MongoDB Atlas

**Seed Script Issues:**
- Make sure MongoDB is running before seeding
- Check if `.env.local` file exists
- Verify database permissions

**PDF Generation Issues:**
- Ensure jsPDF is properly installed
- Check browser popup blockers
- Verify API route permissions

## 📝 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Next.js, TypeScript, MongoDB, and modern web technologies**