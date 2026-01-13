import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Doctor from '@/models/Doctor';
import Hospital from '@/models/Hospital';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'hospital') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hospital = await Hospital.findOne({ userId: decoded.userId });
    if (!hospital) {
      return NextResponse.json({ error: 'Hospital profile not found' }, { status: 404 });
    }

    const { name, specialization, experience, qualification, consultationFee, availableSlots } = await request.json();

    const doctor = await Doctor.create({
      hospitalId: hospital._id,
      name,
      specialization,
      experience,
      qualification,
      consultationFee,
      availableSlots
    });

    return NextResponse.json({ message: 'Doctor added successfully', doctor });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'hospital') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hospital = await Hospital.findOne({ userId: decoded.userId });
    if (!hospital) {
      return NextResponse.json({ error: 'Hospital profile not found' }, { status: 404 });
    }

    const doctors = await Doctor.find({ hospitalId: hospital._id });
    return NextResponse.json({ doctors });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}