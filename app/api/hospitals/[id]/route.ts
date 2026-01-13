import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Hospital from '@/models/Hospital';
import Doctor from '@/models/Doctor';
import BedAvailability from '@/models/BedAvailability';
import BloodInventory from '@/models/BloodInventory';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = params;

    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
    }

    const doctors = await Doctor.find({ hospitalId: id });
    const bedAvailability = await BedAvailability.findOne({ hospitalId: id });
    const bloodInventory = await BloodInventory.find({ hospitalId: id });

    return NextResponse.json({
      hospital,
      doctors,
      bedAvailability,
      bloodInventory
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}