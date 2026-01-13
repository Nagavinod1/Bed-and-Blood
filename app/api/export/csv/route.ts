import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const Hospital = mongoose.model('Hospital');
    const Doctor = mongoose.model('Doctor');

    const hospitals = await Hospital.find().populate('userId', 'name email phone');
    const doctors = await Doctor.find().populate('hospitalId', 'name');

    // Create CSV Header
    let csvContent = 'Hospital Name,Admin Name,Admin Email,Admin Phone,Address,Phone,City,Specialties,Rating,Total Reviews,Doctor Name,Specialization,Experience,Consultation Fee,Qualification,Available Slots,Status\n';

    // Add rows
    hospitals.forEach((hospital: any) => {
      const hospitalDoctors = doctors.filter(
        (d: any) => d.hospitalId?._id?.toString() === hospital._id.toString()
      );

      if (hospitalDoctors.length === 0) {
        const row = [
          `"${hospital.name}"`,
          `"${hospital.userId?.name || ''}"`,
          `"${hospital.userId?.email || ''}"`,
          `"${hospital.userId?.phone || ''}"`,
          `"${hospital.address}"`,
          `"${hospital.phone}"`,
          `"${hospital.city}"`,
          `"${hospital.specialties.join('; ')}"`,
          hospital.rating || 0,
          hospital.totalReviews || 0,
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""'
        ].join(',');
        csvContent += row + '\n';
      } else {
        hospitalDoctors.forEach((doc: any, index: number) => {
          const row = [
            index === 0 ? `"${hospital.name}"` : '""',
            index === 0 ? `"${hospital.userId?.name || ''}"` : '""',
            index === 0 ? `"${hospital.userId?.email || ''}"` : '""',
            index === 0 ? `"${hospital.userId?.phone || ''}"` : '""',
            index === 0 ? `"${hospital.address}"` : '""',
            index === 0 ? `"${hospital.phone}"` : '""',
            index === 0 ? `"${hospital.city}"` : '""',
            index === 0 ? `"${hospital.specialties.join('; ')}"` : '""',
            index === 0 ? hospital.rating || 0 : '',
            index === 0 ? hospital.totalReviews || 0 : '',
            `"${doc.name}"`,
            `"${doc.specialization}"`,
            doc.experience || 0,
            doc.consultationFee || 0,
            `"${doc.qualification}"`,
            `"${doc.availableSlots.join('; ')}"`,
            doc.isAvailable ? 'Active' : 'Inactive'
          ].join(',');
          csvContent += row + '\n';
        });
      }
    });

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="hospitals-doctors.csv"'
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
