# 🏥 DETAILED FILE-BY-FILE ANALYSIS REPORT

**Senior Full Stack Developer Review**  
**Date**: January 13, 2026  
**Project**: Hospital Management System (Bed-and-Blood)

---

## 📄 FILE: `package.json`

✅ **Purpose**: Define project dependencies, scripts, and metadata

📌 **Key Logic**:
- Development: `npm run dev` (Next.js development server)
- Build: `npm run build` (Production build)
- Seeding: `npm run seed` (Populate MongoDB with test data)
- Scraping: `npm run scrape:eraktkosh` (Blood bank data scraper)

🔗 **Connected With**:
- All source files (dependencies)
- CI/CD pipelines
- Development environment

⚠️ **Issues Found**:
- ❌ No `.npmrc` file for security
- ❌ No `engines` field to specify Node.js version
- ❌ No security audit script
- ❌ All dependencies at loose versions (not pinned)

✅ **Fixes**:
```json
{
  "engines": {
    "node": ">=18.17.0",
    "npm": ">=9.0.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "seed": "node seed.js",
    "scrape:eraktkosh": "npx tsx scripts/eraktkoshScraper.ts",
    "audit": "npm audit --audit-level=moderate",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 📄 FILE: `tsconfig.json`

✅ **Purpose**: TypeScript compiler configuration

📌 **Key Settings**:
- `strict: true` ✅ Good - enforces strict type checking
- `target: es5` ✅ Good - wide browser compatibility
- `baseUrl & paths` ✅ Good - path alias (`@/*`)
- `noEmit: true` ✅ Good - only type checks, doesn't emit

🔗 **Connected With**: All TypeScript files in the project

⚠️ **Issues Found**: None - well configured

✅ **Enhancement** (Optional):
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true
  }
}
```

---

## 📄 FILE: `lib/db.ts`

✅ **Purpose**: MongoDB connection with connection pooling and caching

📌 **Key Logic**:
- Global caching to prevent multiple connections
- Async connection on first call
- Reuses existing connection for subsequent calls

🔗 **Connected With**:
- All API routes
- All models
- seed.js

⚠️ **Issues Found**:
- ❌ No timeout configuration
- ❌ No retry logic for failed connections
- ❌ No connection event logging
- ❌ No graceful shutdown handler

✅ **Improved Version**:
```typescript
import mongoose from 'mongoose';
import { logger } from './logger';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_TIMEOUT = 10000; // 10 seconds

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    logger.debug('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      socketTimeoutMS: MONGODB_TIMEOUT,
      serverSelectionTimeoutMS: MONGODB_TIMEOUT,
      retryWrites: true,
      retryReads: true,
      maxPoolSize: 10,
      minPoolSize: 2,
    };

    logger.info('Connecting to MongoDB...');

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        logger.info('MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        logger.error('MongoDB connection failed', error);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Graceful shutdown
if (typeof window === 'undefined') {
  process.on('SIGINT', async () => {
    if (cached.conn) {
      await cached.conn.disconnect();
      logger.info('MongoDB disconnected on shutdown');
    }
  });
}

export default dbConnect;
```

---

## 📄 FILE: `lib/jwt.ts`

✅ **Purpose**: JWT token signing and verification

📌 **Key Logic**:
- `signToken()`: Creates 7-day expiring tokens
- `verifyToken()`: Safely verifies tokens with error handling

🔗 **Connected With**:
- All auth endpoints
- All protected routes
- Middleware

⚠️ **Issues Found**:
- ❌ No token refresh mechanism
- ❌ No token revocation/blacklist
- ❌ Weak type safety (returns null on error)
- ❌ No validation of JWT_SECRET existence at runtime

✅ **Improved Version**:
```typescript
import jwt from 'jsonwebtoken';
import { logger } from './logger';

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface JwtPayload {
  userId: string;
  role: 'patient' | 'hospital';
  iat?: number;
  exp?: number;
}

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  try {
    return jwt.sign(payload, JWT_SECRET!, { expiresIn: TOKEN_EXPIRY });
  } catch (error) {
    logger.error('Failed to sign token', error);
    throw new Error('Token signing failed');
  }
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET!) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Token expired', { token: token.substring(0, 20) });
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid token', { error: error.message });
    }
    return null;
  }
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
}
```

---

## 📄 FILE: `models/User.ts`

✅ **Purpose**: Define user schema (Patients & Hospital Admins)

📌 **Key Logic**:
- Two roles: `patient` and `hospital`
- Pre-save hook: Auto-hashes passwords with bcryptjs
- Instance method: `comparePassword()` for login verification

🔗 **Connected With**:
- Auth endpoints
- All protected endpoints
- Hospital model (references userId)
- Appointment model (references patientId)

⚠️ **Issues Found**:
- ❌ No unique index on email (only schema-level unique)
- ❌ No email validation
- ❌ No phone format validation
- ❌ No password strength requirements
- ❌ Missing `updatedAt` query index
- ❌ No soft delete support

✅ **Improved Version**:
```typescript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      sparse: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: {
        values: ['patient', 'hospital'],
        message: 'Role must be either patient or hospital',
      },
      required: [true, 'Role is required'],
    },
    phone: {
      type: String,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
    },
    address: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
  },
  { timestamps: true }
);

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method: compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method: sanitize user object
userSchema.methods.toJSON = function () {
  const { password, ...user } = this.toObject();
  return user;
};

export default mongoose.models.User || mongoose.model('User', userSchema);
```

---

## 📄 FILE: `models/Hospital.ts`

✅ **Purpose**: Define hospital profile schema

📌 **Key Logic**:
- References user (hospital admin)
- Stores hospital details, specialties, ratings
- Has many doctors, appointments, beds

🔗 **Connected With**:
- User model (userId reference)
- Doctor model (referenced)
- Appointment model (referenced)
- BedAvailability model
- BloodInventory model

⚠️ **Issues Found**:
- ❌ No validation for hospital name uniqueness per city
- ❌ No email/phone validation
- ❌ No coordinates for location services
- ❌ No operating hours
- ❌ No capacity limits

✅ **Improved Version** (partial):
```typescript
const hospitalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One hospital per user
    },
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    phone: {
      type: String,
      required: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'],
    },
    email: {
      type: String,
      required: true,
      match: [/^[\w.-]+@[\w.-]+\.\w+$/, 'Invalid email'],
    },
    description: String,
    specialties: [String],
    city: {
      type: String,
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        sparse: true,
      },
    },
    operatingHours: {
      monday: { open: String, close: String },
      // ... other days
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Geospatial index for location queries
hospitalSchema.index({ coordinates: '2dsphere' });
hospitalSchema.index({ city: 1, name: 1 });
```

---

## 📄 FILE: `app/api/auth/login/route.ts`

✅ **Purpose**: Handle user authentication (login)

📌 **Key Logic**:
- Validate credentials
- Hash password comparison
- Generate JWT token
- Set httpOnly cookie

🔗 **Connected With**:
- User model
- JWT utilities
- Navbar component (logout flow)
- Dashboard pages

⚠️ **Issues Found**:
- ❌ **CRITICAL**: No input validation
- ❌ No rate limiting (brute force possible)
- ❌ Generic error message (could inform attacker)
- ❌ No logging
- ❌ No error ID for debugging
- ❌ Truthy check without type casting

✅ **Fixed Version** (see PROFESSIONAL_CODE_ANALYSIS.md for full version)

---

## 📄 FILE: `app/api/auth/signup/route.ts`

✅ **Purpose**: Handle user registration

📌 **Key Logic**:
- Validate email uniqueness
- Create new user
- Generate JWT token
- Set httpOnly cookie

🔗 **Connected With**:
- User model
- JWT utilities
- Login flow

⚠️ **Issues Found**:
- ❌ **CRITICAL**: No input validation
- ❌ No password strength check
- ❌ No email verification (can fake emails)
- ❌ Generic error handling
- ❌ No rate limiting

✅ **Fix**: See validation.ts improvements

---

## 📄 FILE: `app/api/doctors/route.ts`

✅ **Purpose**: Manage doctors (hospital admin only)

📌 **Key Logic**:
- POST: Add new doctor to hospital
- GET: Retrieve hospital's doctors

🔗 **Connected With**:
- Doctor model
- Hospital model
- User authentication

⚠️ **Issues Found**:
- ❌ **CRITICAL**: Repeated auth validation code
- ❌ No input validation for doctor data
- ❌ No availability slot validation
- ❌ No consultation fee validation (could be negative)
- ❌ Line 59 incomplete (file truncated in read)

✅ **Refactored with Middleware**:
```typescript
import { withAuth } from '@/lib/middleware';
import { DoctorSchema } from '@/lib/validation';
import { verifyHospitalAuth } from '@/lib/utils';

async function POST(request: NextRequest) {
  const body = await request.json();
  const doctorData = DoctorSchema.parse(body);

  const hospital = await verifyHospitalAuth(request.user!);

  const doctor = await Doctor.create({
    hospitalId: hospital._id,
    ...doctorData,
  });

  return NextResponse.json({ success: true, data: { doctor } });
}

export { POST };
```

---

## 📄 FILE: `app/api/appointments/route.ts`

✅ **Purpose**: Manage appointment bookings

📌 **Key Logic**:
- POST: Book new appointment (patients only)
- GET: Fetch appointments (both roles)
- Creates notification for hospital admin

🔗 **Connected With**:
- Appointment model
- Notification model
- Hospital model
- User authentication

⚠️ **Issues Found**:
- ❌ **CRITICAL**: No validation
- ❌ No checking if time slot is available
- ❌ No checking if doctor exists for hospital
- ❌ No preventing past date appointments
- ❌ No double-booking prevention
- ❌ Incomplete GET implementation (truncated)

✅ **Validation Needed**:
```typescript
const AppointmentSchema = z.object({
  hospitalId: z.string().refine(isValidObjectId),
  doctorId: z.string().refine(isValidObjectId),
  appointmentDate: z.string().refine(d => new Date(d) > new Date()),
  timeSlot: z.string().regex(/^([0-1]\d|2[0-3]):[0-5]\d$/),
  symptoms: z.string().optional(),
});
```

---

## 📄 FILE: `app/api/hospitals/[id]/route.ts`

✅ **Purpose**: Get hospital details (public endpoint)

📌 **Key Logic**:
- Fetch hospital, doctors, beds, blood inventory by ID
- Returns comprehensive hospital information

🔗 **Connected With**:
- Hospital model
- Doctor model
- BedAvailability model
- BloodInventory model
- Hospital detail page

⚠️ **Issues Found**:
- ❌ No ID validation (MongoDB ObjectId format)
- ❌ No 404 error details
- ❌ Generic error handling
- ❌ Could N+1 query (fetch doctors separately)

✅ **Improved Version**:
```typescript
import { NotFoundError } from '@/lib/errors';
import { isValidObjectId } from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Validate ID format
    if (!isValidObjectId(params.id)) {
      throw new ValidationError('Invalid hospital ID format');
    }

    // Fetch all data in parallel
    const [hospital, doctors, bedAvailability, bloodInventory] =
      await Promise.all([
        Hospital.findById(params.id).lean(),
        Doctor.find({ hospitalId: params.id }).lean(),
        BedAvailability.findOne({ hospitalId: params.id }).lean(),
        BloodInventory.find({ hospitalId: params.id }).lean(),
      ]);

    if (!hospital) {
      throw new NotFoundError('Hospital');
    }

    return NextResponse.json({
      success: true,
      data: { hospital, doctors, bedAvailability, bloodInventory },
    });
  } catch (error) {
    // Handle error
  }
}
```

---

## 📄 FILE: `components/Navbar.tsx`

✅ **Purpose**: Navigation bar with auth state

📌 **Key Logic**:
- Shows different menu based on auth state
- Mobile-responsive with hamburger menu
- Logout functionality
- User profile display

🔗 **Connected With**:
- All pages (imported in layout)
- Auth pages
- Dashboard pages

⚠️ **Issues Found**:
- ❌ User data stored in localStorage (security risk for sensitive data)
- ❌ No logout error handling
- ❌ Hard-coded navigation routes (not scalable)
- ⚠️ No role-based nav items hiding

✅ **Improved Version** (partial):
```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  role: 'patient' | 'hospital';
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Fetch user from API instead of localStorage
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include',
        });
        if (response.ok) {
          const { user } = await response.json();
          setUser(user);
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setUser(null);
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Logout failed');
      console.error(error);
    }
  };

  const navigationItems = user
    ? user.role === 'patient'
      ? [
          { href: '/hospitals', label: 'Hospitals' },
          { href: '/blood', label: 'Blood Banks' },
          { href: '/dashboard/patient', label: 'My Appointments' },
        ]
      : [
          { href: '/dashboard/hospital', label: 'Dashboard' },
          { href: '/hospitals', label: 'Browse Hospitals' },
        ]
    : [];

  return (
    <nav className="bg-white shadow-lg">
      {/* Render navigation */}
    </nav>
  );
}
```

---

## 📄 FILE: `app/page.tsx` (Home Page)

✅ **Purpose**: Landing page with feature overview

📌 **Key Logic**:
- Check if user is logged in
- Show appropriate CTA buttons
- Display features
- How-it-works section

🔗 **Connected With**:
- Navbar component
- Auth pages
- Hospital pages

⚠️ **Issues Found**:
- ⚠️ Makes auth check on every page load (should be in context/hook)
- ⚠️ No loading skeleton
- ⚠️ Hardcoded strings (should be constants)
- ✅ Otherwise well-structured

---

## 📄 FILE: `app/auth/login/page.tsx`

✅ **Purpose**: User login form page

📌 **Key Logic**:
- Email and password form
- Form submission to `/api/auth/login`
- Redirect to appropriate dashboard
- Error/success toast notifications

🔗 **Connected With**:
- Auth API
- Signup page
- Dashboard pages

⚠️ **Issues Found**:
- ⚠️ No "Forgot Password" functionality
- ⚠️ No form validation on frontend (only backend)
- ✅ Loading state handled correctly
- ✅ Error handling looks good

---

## 📄 FILES: Export API Routes

### `app/api/export/hospitals-doctors/route.ts` ✅

**Purpose**: Export hospitals and doctors as JSON

**Features**:
- ✅ Populates user references
- ✅ Includes statistics
- ✅ Proper error handling

**Improvements**:
- Add pagination
- Add filtering options
- Add error response type

### `app/api/export/pdf/route.ts` ✅

**Purpose**: Generate professional PDF report

**Features**:
- ✅ Creates formatted table with jsPDF-autotable
- ✅ Multi-page support
- ✅ Summary statistics

**Improvements**:
- Add header/footer with company logo
- Add date/time watermark
- Add digital signature
- Add table of contents for large exports

### `app/api/export/csv/route.ts` ✅

**Purpose**: Export data as CSV

**Features**:
- ✅ Excel-compatible format
- ✅ Proper CSV escaping
- ✅ Multiple rows per hospital

**Improvements**:
- Add BOM for UTF-8 Excel compatibility
- Add custom column selection
- Add export filters

---

## 📊 OVERALL CODE QUALITY SCORECARD

| Category | Score | Comment |
|----------|-------|---------|
| **Architecture** | 7/10 | Good structure, needs middleware |
| **Security** | 5/10 | JWT good, but missing validation & rate limiting |
| **Error Handling** | 3/10 | Too generic, needs improvements |
| **Type Safety** | 6/10 | Uses TypeScript, but missing interfaces |
| **Code Reusability** | 4/10 | Much repeated code, needs refactoring |
| **Logging** | 2/10 | No logging system |
| **Testing** | 0/10 | No tests found |
| **Documentation** | 8/10 | Good external docs, needs inline JSDoc |
| **Performance** | 7/10 | Good, but needs pagination |
| **Database Design** | 8/10 | Well-designed schemas |
| **UI/UX** | 8/10 | Clean, responsive design |
| **Feature Completeness** | 9/10 | All core features working |

**Overall Score: 6/10** ➡️ **Good Foundation, Needs Hardening**

---

**End of Analysis Report**

Next steps in PROFESSIONAL_CODE_ANALYSIS.md
