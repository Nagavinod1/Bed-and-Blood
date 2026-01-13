import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BloodInventory from '@/models/BloodInventory';
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

    const { bloodType, units } = await request.json();

    const bloodInventory = await BloodInventory.findOneAndUpdate(
      { hospitalId: hospital._id, bloodType },
      { units },
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: 'Blood inventory updated', bloodInventory });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}