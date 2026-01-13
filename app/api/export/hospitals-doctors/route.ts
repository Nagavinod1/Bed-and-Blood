import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const Hospital = mongoose.model('Hospital');
    const Doctor = mongoose.model('Doctor');
    const User = mongoose.model('User');

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
      rating: hospital.rating,
      totalReviews: hospital.totalReviews,
      doctors: doctors
        .filter((d: any) => d.hospitalId?._id?.toString() === hospital._id.toString())
        .map((doc: any) => ({
          doctorName: doc.name,
          specialization: doc.specialization,
          experience: doc.experience,
          qualification: doc.qualification,
          consultationFee: doc.consultationFee,
          availableSlots: doc.availableSlots.join(', '),
          isAvailable: doc.isAvailable
        }))
    }));

    return NextResponse.json({
      success: true,
      totalHospitals: hospitals.length,
      totalDoctors: doctors.length,
      data: exportData
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
