import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BedAvailability from '@/models/BedAvailability';
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

    const { generalBeds, icuBeds } = await request.json();

    const bedAvailability = await BedAvailability.findOneAndUpdate(
      { hospitalId: hospital._id },
      { generalBeds, icuBeds },
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: 'Bed availability updated', bedAvailability });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}