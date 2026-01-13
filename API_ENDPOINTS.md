# Hospital Management System - API Documentation

## Base URL
```
http://localhost:3000/api
```

---

## Authentication Endpoints

### 1. User Login
**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and receive JWT token

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "patient|hospital|admin"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

**Authentication:** None (public endpoint)
**Cookie Set:** `token` (httpOnly, 7 days expiry)

---

### 2. User Signup
**Endpoint:** `POST /auth/signup`

**Description:** Register a new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "role": "patient|hospital",
  "phone": "+91-9876543210",
  "address": "123 Main St, City"
}
```

**Response (200 OK):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "patient|hospital"
  }
}
```

**Error Response (400):**
```json
{
  "error": "User already exists"
}
```

**Authentication:** None (public endpoint)
**Cookie Set:** `token` (httpOnly, 7 days expiry)

---

### 3. Logout
**Endpoint:** `POST /auth/logout`

**Description:** Clear authentication token

**Request Body:** Empty

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

## Hospital Endpoints

### 1. Search Hospitals
**Endpoint:** `GET /hospitals/search`

**Description:** Search hospitals with filters

**Query Parameters:**
- `q` (optional): Search query (searches in name, specialties, address)
- `city` (optional): Filter by city
- `specialization` (optional): Filter by medical specialization
- `sortBy` (optional): 'name', 'rating' (default: 'name')
- `sortOrder` (optional): 'asc' or 'desc' (default: 'asc')

**Example:**
```
GET /hospitals/search?q=cardiology&city=New York&sortBy=rating&sortOrder=desc
```

**Response (200 OK):**
```json
{
  "hospitals": [
    {
      "_id": "hospital_id",
      "name": "City Medical Center",
      "address": "123 Medical St",
      "city": "New York",
      "phone": "+1-555-1234",
      "email": "contact@hospital.com",
      "specialties": ["Cardiology", "Neurology"],
      "rating": 4.5,
      "totalReviews": 150
    }
  ]
}
```

**Authentication:** None (public endpoint)
**Max Results:** 50

---

### 2. Get Hospital Details
**Endpoint:** `GET /hospitals/{id}`

**Description:** Get complete hospital profile with doctors and inventory

**Path Parameters:**
- `id` (required): Hospital MongoDB ID

**Response (200 OK):**
```json
{
  "hospital": {
    "_id": "hospital_id",
    "name": "City Medical Center",
    "address": "123 Medical St",
    "phone": "+1-555-1234",
    "email": "contact@hospital.com",
    "description": "Leading healthcare provider",
    "specialties": ["Cardiology", "Neurology"],
    "rating": 4.5,
    "totalReviews": 150
  },
  "doctors": [
    {
      "_id": "doctor_id",
      "name": "Dr. Smith",
      "specialization": "Cardiology",
      "experience": 15,
      "consultationFee": 500,
      "qualification": "MD, Board Certified"
    }
  ],
  "bedAvailability": {
    "_id": "bed_id",
    "generalBeds": 50,
    "icuBeds": 10
  },
  "bloodInventory": [
    {
      "_id": "blood_id",
      "bloodType": "O+",
      "units": 25
    }
  ]
}
```

**Authentication:** None (public endpoint)

---

### 3. Hospital Profile Setup/Update
**Endpoint:** `POST /hospitals/profile`

**Description:** Create or update hospital profile (Hospital Admin only)

**Authentication:** Required (role: 'hospital')
**Cookie Required:** `token`

**Request Body:**
```json
{
  "name": "City Medical Center",
  "address": "123 Medical St",
  "phone": "+1-555-1234",
  "email": "contact@hospital.com",
  "description": "Leading healthcare provider",
  "specialties": ["Cardiology", "Neurology", "Surgery"]
}
```

**Response (200 OK):**
```json
{
  "message": "Hospital profile updated",
  "hospital": {
    "_id": "hospital_id",
    "name": "City Medical Center",
    "userId": "user_id",
    "address": "123 Medical St",
    "phone": "+1-555-1234",
    "email": "contact@hospital.com",
    "description": "Leading healthcare provider",
    "specialties": ["Cardiology", "Neurology", "Surgery"]
  }
}
```

**Error Response (401):**
```json
{
  "error": "Unauthorized"
}
```

---

### 4. Get Hospital Profile
**Endpoint:** `GET /hospitals/profile`

**Description:** Get current logged-in hospital's profile

**Authentication:** Required (role: 'hospital')
**Cookie Required:** `token`

**Response (200 OK):**
```json
{
  "hospital": {
    "_id": "hospital_id",
    "name": "City Medical Center",
    "userId": "user_id",
    "address": "123 Medical St",
    "phone": "+1-555-1234",
    "email": "contact@hospital.com",
    "specialties": ["Cardiology", "Neurology"]
  }
}
```

---

## Doctor Endpoints

### 1. Add Doctor
**Endpoint:** `POST /doctors`

**Description:** Add a new doctor to hospital (Hospital Admin only)

**Authentication:** Required (role: 'hospital')
**Cookie Required:** `token`

**Request Body:**
```json
{
  "name": "Dr. John Smith",
  "specialization": "Cardiology",
  "experience": 15,
  "qualification": "MD, Board Certified",
  "consultationFee": 500,
  "availableSlots": ["09:00-10:00", "10:00-11:00", "14:00-15:00"]
}
```

**Response (200 OK):**
```json
{
  "message": "Doctor added successfully",
  "doctor": {
    "_id": "doctor_id",
    "hospitalId": "hospital_id",
    "name": "Dr. John Smith",
    "specialization": "Cardiology",
    "experience": 15,
    "qualification": "MD, Board Certified",
    "consultationFee": 500,
    "availableSlots": ["09:00-10:00", "10:00-11:00", "14:00-15:00"]
  }
}
```

---

### 2. Get Hospital Doctors
**Endpoint:** `GET /doctors`

**Description:** Get all doctors of logged-in hospital

**Authentication:** Required (role: 'hospital')
**Cookie Required:** `token`

**Response (200 OK):**
```json
{
  "doctors": [
    {
      "_id": "doctor_id",
      "name": "Dr. John Smith",
      "specialization": "Cardiology",
      "experience": 15,
      "consultationFee": 500
    }
  ]
}
```

---

## Appointment Endpoints

### 1. Book Appointment
**Endpoint:** `POST /appointments`

**Description:** Book a new appointment (Patient only)

**Authentication:** Required (role: 'patient')
**Cookie Required:** `token`

**Request Body:**
```json
{
  "hospitalId": "hospital_id",
  "doctorId": "doctor_id",
  "appointmentDate": "2026-01-20",
  "timeSlot": "10:00-11:00",
  "symptoms": "Chest pain, shortness of breath"
}
```

**Response (200 OK):**
```json
{
  "message": "Appointment booked successfully",
  "appointment": {
    "_id": "appointment_id",
    "patientId": "patient_id",
    "hospitalId": "hospital_id",
    "doctorId": "doctor_id",
    "appointmentDate": "2026-01-20",
    "timeSlot": "10:00-11:00",
    "symptoms": "Chest pain, shortness of breath",
    "status": "pending"
  }
}
```

**Side Effect:** Hospital admin receives notification

---

### 2. Get Appointments
**Endpoint:** `GET /appointments`

**Description:** Get user appointments (role-based)

**Authentication:** Required
**Cookie Required:** `token`

**Query Parameters:** None

**Response (200 OK - Patient):**
```json
{
  "appointments": [
    {
      "_id": "appointment_id",
      "patientId": "patient_id",
      "hospitalId": "hospital_id",
      "doctorId": "doctor_id",
      "appointmentDate": "2026-01-20",
      "timeSlot": "10:00-11:00",
      "status": "pending|confirmed|completed|cancelled"
    }
  ]
}
```

---

### 3. Update Appointment Status
**Endpoint:** `PATCH /appointments/{id}`

**Description:** Update appointment status (Hospital Admin only)

**Authentication:** Required (role: 'hospital')
**Cookie Required:** `token`

**Path Parameters:**
- `id` (required): Appointment MongoDB ID

**Request Body:**
```json
{
  "status": "confirmed|completed|cancelled",
  "notes": "Patient confirmed, appointment scheduled"
}
```

**Response (200 OK):**
```json
{
  "message": "Appointment updated successfully",
  "appointment": {
    "_id": "appointment_id",
    "status": "confirmed",
    "notes": "Patient confirmed, appointment scheduled"
  }
}
```

**Side Effect:** Patient receives notification based on status

---

## Bed Management Endpoints

### 1. Update Bed Availability
**Endpoint:** `POST /beds`

**Description:** Update hospital bed availability (Hospital Admin only)

**Authentication:** Required (role: 'hospital')
**Cookie Required:** `token`

**Request Body:**
```json
{
  "generalBeds": 45,
  "icuBeds": 8
}
```

**Response (200 OK):**
```json
{
  "message": "Bed availability updated",
  "bedAvailability": {
    "_id": "bed_id",
    "hospitalId": "hospital_id",
    "generalBeds": 45,
    "icuBeds": 8
  }
}
```

---

## Blood Management Endpoints

### 1. Update Blood Inventory
**Endpoint:** `POST /blood`

**Description:** Update blood inventory (Hospital Admin only)

**Authentication:** Required (role: 'hospital')
**Cookie Required:** `token`

**Request Body:**
```json
{
  "bloodType": "O+",
  "units": 25
}
```

**Response (200 OK):**
```json
{
  "message": "Blood inventory updated",
  "bloodInventory": {
    "_id": "blood_id",
    "hospitalId": "hospital_id",
    "bloodType": "O+",
    "units": 25
  }
}
```

---

### 2. Get Blood Availability
**Endpoint:** `GET /blood/availability`

**Description:** Get blood availability across hospitals

**Query Parameters:** None

**Response (200 OK):**
```json
{
  "bloodBanks": [
    {
      "hospitalId": "hospital_id",
      "hospitalName": "City Medical Center",
      "bloodInventory": [
        {
          "bloodType": "O+",
          "units": 25,
          "lastUpdated": "2026-01-13T10:30:00Z"
        }
      ]
    }
  ]
}
```

**Authentication:** None (public endpoint)

---

## Review Endpoints

### 1. Submit Review
**Endpoint:** `POST /reviews`

**Description:** Submit hospital review (Patient only)

**Authentication:** Required (role: 'patient')
**Cookie Required:** `token`

**Request Body:**
```json
{
  "hospitalId": "hospital_id",
  "rating": 4.5,
  "comment": "Excellent service and professional staff!"
}
```

**Response (200 OK):**
```json
{
  "message": "Review submitted successfully",
  "review": {
    "_id": "review_id",
    "patientId": "patient_id",
    "hospitalId": "hospital_id",
    "rating": 4.5,
    "comment": "Excellent service and professional staff!",
    "createdAt": "2026-01-13T10:30:00Z"
  }
}
```

**Side Effect:** Hospital's average rating is automatically updated

---

### 2. Get Hospital Reviews
**Endpoint:** `GET /reviews?hospitalId={id}`

**Description:** Get all reviews for a hospital

**Query Parameters:**
- `hospitalId` (required): Hospital MongoDB ID

**Response (200 OK):**
```json
{
  "reviews": [
    {
      "_id": "review_id",
      "patientId": "patient_id",
      "rating": 4.5,
      "comment": "Excellent service!",
      "createdAt": "2026-01-13T10:30:00Z"
    }
  ],
  "averageRating": 4.3,
  "totalReviews": 45
}
```

**Authentication:** None (public endpoint)

---

## Notification Endpoints

### 1. Get Notifications
**Endpoint:** `GET /notifications`

**Description:** Get user notifications (sorted by latest)

**Authentication:** Required
**Cookie Required:** `token`

**Response (200 OK):**
```json
{
  "notifications": [
    {
      "_id": "notification_id",
      "userId": "user_id",
      "title": "New Appointment Booked",
      "message": "A new appointment has been booked at your hospital",
      "type": "appointment|review|system",
      "data": {
        "appointmentId": "appointment_id"
      },
      "read": false,
      "createdAt": "2026-01-13T10:30:00Z"
    }
  ]
}
```

**Limit:** 20 most recent notifications

---

### 2. Create Notification
**Endpoint:** `POST /notifications`

**Description:** Create notification (System/Admin use)

**Authentication:** None

**Request Body:**
```json
{
  "userId": "user_id",
  "title": "Important Update",
  "message": "System maintenance scheduled",
  "type": "system|appointment|review",
  "data": {
    "key": "value"
  }
}
```

**Response (200 OK):**
```json
{
  "notification": {
    "_id": "notification_id",
    "userId": "user_id",
    "title": "Important Update",
    "message": "System maintenance scheduled",
    "type": "system",
    "read": false,
    "createdAt": "2026-01-13T10:30:00Z"
  }
}
```

---

### 3. Mark Notification as Read
**Endpoint:** `PATCH /notifications/{id}`

**Description:** Mark notification as read

**Authentication:** Required
**Cookie Required:** `token`

**Path Parameters:**
- `id` (required): Notification MongoDB ID

**Request Body:**
```json
{
  "read": true
}
```

**Response (200 OK):**
```json
{
  "notification": {
    "_id": "notification_id",
    "read": true,
    "updatedAt": "2026-01-13T10:35:00Z"
  }
}
```

---

## Report Endpoints

### 1. Get Reports
**Endpoint:** `GET /reports?type={type}&appointmentId={id}`

**Description:** Get reports (role-based)

**Authentication:** Required
**Cookie Required:** `token`

**Query Parameters:**
- `type` (required): 'patient' or 'hospital'
- `appointmentId` (required for patient type): Appointment MongoDB ID

**For Patient:**
```
GET /reports?type=patient&appointmentId=appointment_id
```

**Response (200 OK):**
```json
{
  "appointment": {
    "_id": "appointment_id",
    "appointmentDate": "2026-01-20",
    "timeSlot": "10:00-11:00",
    "symptoms": "Chest pain",
    "status": "completed",
    "hospital": {
      "name": "City Medical Center",
      "address": "123 Medical St",
      "phone": "+1-555-1234"
    },
    "doctor": {
      "name": "Dr. John Smith",
      "specialization": "Cardiology"
    },
    "patient": {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+1-555-5678"
    }
  }
}
```

**For Hospital:**
```
GET /reports?type=hospital
```

**Response (200 OK):**
```json
{
  "appointments": [
    {
      "_id": "appointment_id",
      "appointmentDate": "2026-01-20",
      "status": "completed",
      "patient": {
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "doctor": {
        "name": "Dr. John Smith"
      }
    }
  ]
}
```

**Limit:** 50 most recent

---

## Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | User already exists | Email already registered |
| 401 | Invalid credentials | Wrong email/password |
| 401 | Unauthorized | Missing or invalid token |
| 404 | Not found | Resource doesn't exist |
| 500 | Internal server error | Server-side error |

---

## Authentication Notes

- **Token Storage:** JWT tokens are stored in `httpOnly` cookies
- **Token Expiry:** 7 days
- **Security:** Cookies are secure in production (`secure: true`)
- **SameSite:** Set to `strict` to prevent CSRF attacks
- **Roles:** 'patient', 'hospital', 'admin'

---

## Base URL Example for Testing

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Search Hospitals
curl http://localhost:3000/api/hospitals/search?q=cardiology&city=NewYork

# Get Hospital Details
curl http://localhost:3000/api/hospitals/{hospital_id}

# Book Appointment (requires token cookie)
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Cookie: token=your_jwt_token" \
  -d '{"hospitalId":"...","doctorId":"...","appointmentDate":"2026-01-20","timeSlot":"10:00-11:00","symptoms":"..."}'
```

---

## Database Collections

- `users` - User accounts (patients, hospitals, admins)
- `hospitals` - Hospital profiles
- `doctors` - Doctor information
- `appointments` - Appointment bookings
- `bedavailabilities` - Bed availability tracking
- `bloods` - Blood inventory
- `reviews` - Hospital reviews
- `notifications` - User notifications

