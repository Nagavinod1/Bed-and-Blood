import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
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

    const { name, address, phone, email, description, specialties } = await request.json();

    const hospital = await Hospital.findOneAndUpdate(
      { userId: decoded.userId },
      { name, address, phone, email, description, specialties },
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: 'Hospital profile updated', hospital });
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
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hospital = await Hospital.findOne({ userId: decoded.userId });
    return NextResponse.json({ hospital });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}