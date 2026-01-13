# Quick Reference - MongoDB & Export Features

## 🔧 Setup (First Time Only)

```powershell
# 1. Create .env.local in project root
MONGODB_URI=mongodb://localhost:27017/hospital-management
JWT_SECRET=your-secret-key-here

# 2. Start MongoDB (if using local)
mongod

# 3. Install dependencies
npm install

# 4. Seed database with test data
npm run seed
```

---

## 📊 Export Endpoints (Copy & Paste)

### Get JSON Data
```bash
curl http://localhost:3000/api/export/hospitals-doctors -o data.json
```

### Download PDF Report
```bash
curl http://localhost:3000/api/export/pdf -o hospitals-report.pdf
```

### Download CSV File
```bash
curl http://localhost:3000/api/export/csv -o hospitals-data.csv
```

---

## 🎯 What Gets Exported

### JSON/API Response Includes:
- ✅ All hospitals with ratings
- ✅ Hospital admin details (name, email, phone)
- ✅ All doctors per hospital
- ✅ Doctor specializations & experience
- ✅ Consultation fees
- ✅ Available time slots

### PDF Report Includes:
- ✅ Professional formatted document
- ✅ Hospital details & admin info
- ✅ Doctor list with table format
- ✅ Contact information
- ✅ Summary statistics
- ✅ Rating information

### CSV File Includes:
- ✅ Excel-compatible format
- ✅ All hospital information
- ✅ All doctor details
- ✅ Admin contact details
- ✅ Multiple rows per hospital (one per doctor)

---

## 👥 Sample Login Credentials (After npm run seed)

```
Patient:
  Email: ravikumarreddy@gmail.com
  Password: password123

Hospital Admin:
  Email: rims.kadapa@ap.gov.in
  Password: password123
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| [MONGODB_CONNECTION_GUIDE.md](MONGODB_CONNECTION_GUIDE.md) | Complete connection & usage guide |
| [EXPORT_FEATURES_SUMMARY.md](EXPORT_FEATURES_SUMMARY.md) | Feature overview |
| [API_ENDPOINTS.md](API_ENDPOINTS.md) | All API documentation |
| app/api/export/hospitals-doctors/route.ts | JSON endpoint |
| app/api/export/pdf/route.ts | PDF endpoint |
| app/api/export/csv/route.ts | CSV endpoint |
| components/ExportData.tsx | React component with buttons |

---

## 🚀 Using the React Component

In any page or component:

```tsx
import ExportData from '@/components/ExportData';

export default function MyDashboard() {
  return (
    <div>
      <h1>My Dashboard</h1>
      <ExportData />
    </div>
  );
}
```

---

## 🔍 Database Models Available

```javascript
User        // Patients & Hospital Admins
Hospital    // Hospital profiles
Doctor      // Doctor information
Appointment // Appointment bookings
BedAvailability  // Bed status
BloodInventory   // Blood stock
Review      // Hospital reviews
```

---

## ⚠️ Troubleshooting

### MongoDB Won't Connect
```powershell
# Check if running locally
mongod --version

# Or use MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hospital-management
```

### PDF Not Generating
```bash
npm install jspdf-autotable
npm run build
```

### Ports Already in Use
```powershell
# Next.js default is 3000
npm run dev -- -p 3001
```

---

## 📈 Data Statistics After Seeding

- **Users**: 32 total (20 patients + 12 admins)
- **Hospitals**: 12 hospitals
- **Doctors**: 24 doctors (3 per hospital)
- **Appointments**: 25 sample appointments
- **Reviews**: 20 reviews

---

## 🔐 No Authentication Required

All export endpoints are public and require:
- ✅ No login needed
- ✅ No API key needed
- ✅ No authorization header

(Can be restricted later if needed)

---

## 💾 Environment Variables

```env
# Required
MONGODB_URI=mongodb://localhost:27017/hospital-management

# Optional (for authentication)
JWT_SECRET=your-secret-key-here
```

---

## 🎨 Export Formats

| Format | Use Case | Size | Opening |
|--------|----------|------|---------|
| **JSON** | API Integration | Small | Any text editor / Postman |
| **PDF** | Professional Report | Medium | Adobe Reader / Browser |
| **CSV** | Excel / Spreadsheet | Small | Excel / Google Sheets |

---

## ✅ Verification Checklist

After setup, verify:
- [ ] `.env.local` file created
- [ ] MongoDB running or Atlas configured
- [ ] `npm run seed` completed successfully
- [ ] Can login with sample credentials
- [ ] Export endpoints return data
- [ ] Files download successfully

---

**Ready to Use!** 🎉
Start with: `npm run dev`
