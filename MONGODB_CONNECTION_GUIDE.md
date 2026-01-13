# MongoDB Connection & Data Export Guide

## 1. MongoDB Connection Setup

### Environment Variables
Create a `.env.local` file in the project root with:

```env
MONGODB_URI=mongodb://localhost:27017/hospital-management
# OR for MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/hospital-management?retryWrites=true&w=majority

JWT_SECRET=your-secret-key-here
```

### Connection Details
- **File**: [lib/db.ts](lib/db.ts)
- **Method**: Mongoose with connection pooling
- **Default Local DB**: `mongodb://localhost:27017/hospital-management`
- **Connection Status**: Uses caching to prevent multiple connections

### Start MongoDB Locally
```powershell
# If using local MongoDB
mongod

# Or if using MongoDB Atlas, just update MONGODB_URI
```

---

## 2. Seed Database with Initial Data

### Command
```powershell
npm run seed
```

### Data Seeded:
- **20 Patient Users** with realistic AP/Telangana names
- **12 Hospital Admin Users** (one per hospital)
- **12 Hospitals** in Andhra Pradesh & Telangana
- **24 Doctors** (3 per hospital)
- **25 Sample Appointments**
- **20 Reviews**
- **Bed Availability** for all hospitals
- **Blood Inventory** for all hospitals

### Sample Login Credentials:
```
Patient Email: ravikumarreddy@gmail.com
Password: password123

Hospital Admin Email: rims.kadapa@ap.gov.in
Password: password123
```

---

## 3. Fetch Client & Admin Details

### API Endpoints

#### Get All Users (Patients & Hospital Admins)
```bash
GET /api/auth/check
```

#### Get All Hospitals with Admin Info
```bash
GET /api/hospitals
```

#### Get Specific Hospital Details
```bash
GET /api/hospitals/[id]
```

#### Get Hospital Profile (Current Hospital Admin)
```bash
GET /api/hospitals/profile
# Requires: Authorization header with JWT token
```

#### Get All Doctors
```bash
GET /api/doctors
```

#### Get Doctors by Hospital
```bash
GET /api/doctors?hospitalId=<hospital-id>
```

### Database Models

#### User Model ([models/User.ts](models/User.ts))
```typescript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'patient' | 'hospital',
  phone: String,
  address: String,
  timestamps: { createdAt, updatedAt }
}
```

#### Hospital Model ([models/Hospital.ts](models/Hospital.ts))
```typescript
{
  userId: ObjectId (ref: User),
  name: String,
  address: String,
  phone: String,
  email: String,
  description: String,
  specialties: [String],
  rating: Number,
  totalReviews: Number,
  city: String,
  timestamps: { createdAt, updatedAt }
}
```

#### Doctor Model ([models/Doctor.ts](models/Doctor.ts))
```typescript
{
  hospitalId: ObjectId (ref: Hospital),
  name: String,
  specialization: String,
  experience: Number,
  qualification: String,
  consultationFee: Number,
  availableSlots: [String],
  isAvailable: Boolean,
  timestamps: { createdAt, updatedAt }
}
```

---

## 4. Generate PDF Reports

### Current PDF Generation
**File**: [lib/pdf.ts](lib/pdf.ts)

### Types of Reports:
1. **Patient Appointment Receipt** - Individual appointment details
2. **Hospital Appointments Report** - All appointments for a hospital

### Usage in Frontend:
```typescript
import { generatePDF } from '@/lib/pdf';

// Generate patient appointment receipt
await generatePDF('patient', appointmentId);

// Generate hospital appointments report
await generatePDF('hospital');
```

### API Report Endpoint
```bash
GET /api/reports?type=patient&appointmentId=<id>
GET /api/reports?type=hospital
```

---

## 5. Export Hospitals & Doctors to PDF/File

### Create Hospital & Doctors Export API

Create file: `app/api/export/hospitals-doctors/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';

const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', new mongoose.Schema());
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', new mongoose.Schema());

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const hospitals = await Hospital.find().populate('userId', 'name email phone');
    const doctors = await Doctor.find().populate('hospitalId', 'name');

    // Format data
    const exportData = hospitals.map((hospital: any) => ({
      hospitalName: hospital.name,
      adminName: hospital.userId?.name,
      adminEmail: hospital.userId?.email,
      adminPhone: hospital.userId?.phone,
      hospitalAddress: hospital.address,
      hospitalPhone: hospital.phone,
      hospitalEmail: hospital.email,
      city: hospital.city,
      specialties: hospital.specialties.join(', '),
      doctors: doctors
        .filter((d: any) => d.hospitalId?._id?.toString() === hospital._id.toString())
        .map((doc: any) => ({
          doctorName: doc.name,
          specialization: doc.specialization,
          experience: doc.experience,
          qualification: doc.qualification,
          consultationFee: doc.consultationFee,
          availableSlots: doc.availableSlots.join(', ')
        }))
    }));

    return NextResponse.json(exportData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
```

### Export as JSON
```bash
GET /api/export/hospitals-doctors
```

---

## 6. Generate PDF Report with Hospital & Doctors List

Create file: `app/api/export/pdf/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', new mongoose.Schema());
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', new mongoose.Schema());

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const hospitals = await Hospital.find().populate('userId', 'name email phone');
    const doctors = await Doctor.find().populate('hospitalId', 'name');

    const doc = new jsPDF();
    let yPosition = 20;

    // Title
    doc.setFontSize(18);
    doc.text('Hospital Management System', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 15;

    // Process each hospital
    hospitals.forEach((hospital: any, index: number) => {
      // Add page if needed
      if (yPosition > 230) {
        doc.addPage();
        yPosition = 20;
      }

      // Hospital Header
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 139); // Dark blue
      doc.text(`Hospital ${index + 1}: ${hospital.name}`, 20, yPosition);
      yPosition += 8;

      // Hospital Admin Info
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Admin: ${hospital.userId?.name || 'N/A'}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Email: ${hospital.userId?.email || 'N/A'}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Phone: ${hospital.userId?.phone || 'N/A'}`, 25, yPosition);
      yPosition += 6;

      // Hospital Details
      doc.text(`Address: ${hospital.address}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Phone: ${hospital.phone}`, 25, yPosition);
      yPosition += 6;
      doc.text(`City: ${hospital.city}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Specialties: ${hospital.specialties.join(', ')}`, 25, yPosition);
      yPosition += 10;

      // Doctors Table for this hospital
      const hospitalDoctors = doctors.filter(
        (d: any) => d.hospitalId?._id?.toString() === hospital._id.toString()
      );

      if (hospitalDoctors.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);
        doc.text('Doctors:', 25, yPosition);
        yPosition += 7;

        doc.setFontSize(9);
        const doctorRows = hospitalDoctors.map((doc: any) => [
          doc.name,
          doc.specialization,
          `${doc.experience} yrs`,
          `₹${doc.consultationFee}`,
          doc.qualification
        ]);

        (doc as any).autoTable({
          startY: yPosition,
          head: [['Name', 'Specialization', 'Experience', 'Fee', 'Qualification']],
          body: doctorRows,
          margin: { left: 25, right: 20 },
          theme: 'grid',
          headStyles: { fillColor: [100, 150, 200] },
          didDrawPage: function(data: any) {
            yPosition = data.lastAutoTable.finalY + 10;
          }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.setFontSize(9);
        doc.text('No doctors assigned', 25, yPosition);
        yPosition += 10;
      }

      yPosition += 5;
    });

    // Convert to blob and return
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=hospitals-doctors-report.pdf'
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
```

### Generate PDF Report
```bash
GET /api/export/pdf
# Downloads: hospitals-doctors-report.pdf
```

---

## 7. Export as CSV

Create file: `app/api/export/csv/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';

const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', new mongoose.Schema());
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', new mongoose.Schema());

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const hospitals = await Hospital.find().populate('userId', 'name email phone');
    const doctors = await Doctor.find().populate('hospitalId', 'name');

    // Create CSV Header
    let csvContent = 'Hospital Name,Admin Name,Admin Email,Admin Phone,Address,Phone,City,Specialties,Doctor Name,Doctor Specialization,Doctor Experience,Doctor Fee,Doctor Qualification\n';

    // Add rows
    hospitals.forEach((hospital: any) => {
      const hospitalDoctors = doctors.filter(
        (d: any) => d.hospitalId?._id?.toString() === hospital._id.toString()
      );

      if (hospitalDoctors.length === 0) {
        csvContent += `"${hospital.name}","${hospital.userId?.name || ''}","${hospital.userId?.email || ''}","${hospital.userId?.phone || ''}","${hospital.address}","${hospital.phone}","${hospital.city}","${hospital.specialties.join('; ')}","","","","",""\n`;
      } else {
        hospitalDoctors.forEach((doc: any, index: number) => {
          if (index === 0) {
            csvContent += `"${hospital.name}","${hospital.userId?.name || ''}","${hospital.userId?.email || ''}","${hospital.userId?.phone || ''}","${hospital.address}","${hospital.phone}","${hospital.city}","${hospital.specialties.join('; ')}","${doc.name}","${doc.specialization}","${doc.experience}","${doc.consultationFee}","${doc.qualification}"\n`;
          } else {
            csvContent += `"","","","","","","","","${doc.name}","${doc.specialization}","${doc.experience}","${doc.consultationFee}","${doc.qualification}"\n`;
          }
        });
      }
    });

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=hospitals-doctors.csv'
      }
    });
  } catch (error) {
    console.error('CSV generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSV' },
      { status: 500 }
    );
  }
}
```

### Generate CSV Export
```bash
GET /api/export/csv
# Downloads: hospitals-doctors.csv
```

---

## 8. Frontend Export Component

Create file: `components/ExportData.tsx`

```typescript
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ExportData() {
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: 'json' | 'pdf' | 'csv') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/export/${format === 'json' ? 'hospitals-doctors' : format}`);
      
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileExtension = format === 'json' ? 'json' : format;
      link.download = `hospitals-doctors-report.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`${format.toUpperCase()} exported successfully!`);
    } catch (error) {
      toast.error('Export failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={() => handleExport('json')}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Export JSON
      </button>
      <button
        onClick={() => handleExport('pdf')}
        disabled={loading}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Export PDF
      </button>
      <button
        onClick={() => handleExport('csv')}
        disabled={loading}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Export CSV
      </button>
    </div>
  );
}
```

---

## 9. Package Dependencies

Ensure these are in [package.json](package.json):

```json
{
  "mongoose": "^8.0.0",
  "jspdf": "^4.0.0",
  "jspdf-autotable": "^3.5.31"
}
```

Install if missing:
```bash
npm install jspdf-autotable
```

---

## 10. Summary of Features

| Feature | Endpoint | Format | Description |
|---------|----------|--------|-------------|
| Get All Data | GET `/api/export/hospitals-doctors` | JSON | All hospitals with admins and doctors |
| PDF Report | GET `/api/export/pdf` | PDF | Formatted report with tables |
| CSV Export | GET `/api/export/csv` | CSV | Excel-compatible format |
| Hospital Details | GET `/api/hospitals` | JSON | All hospitals |
| Doctor List | GET `/api/doctors` | JSON | All doctors |
| Appointments | GET `/api/appointments` | JSON | All appointments |
| User Details | GET `/api/auth/check` | JSON | Current logged-in user |

---

## 11. Troubleshooting

### MongoDB Connection Issues
- Check MONGODB_URI in `.env.local`
- Verify MongoDB service is running
- Check network connection for Atlas

### PDF Generation Issues
- Ensure jspdf and jspdf-autotable are installed
- Clear next cache: `npm run build`

### Authentication Issues
- Include JWT token in Authorization header for protected endpoints
- Login first to get token
