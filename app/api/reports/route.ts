import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Appointment from '@/models/Appointment';
import Hospital from '@/models/Hospital';
import { verifyToken } from '@/lib/jwt';

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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const appointmentId = searchParams.get('appointmentId');

    if (type === 'patient' && appointmentId) {
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        patientId: decoded.userId
      })
        .populate('hospitalId', 'name address phone')
        .populate('doctorId', 'name specialization')
        .populate('patientId', 'name email phone');

      if (!appointment) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }

      return NextResponse.json({ appointment });
      
    } else if (type === 'hospital' && decoded.role === 'hospital') {
      const hospital = await Hospital.findOne({ userId: decoded.userId });
      if (!hospital) {
        return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
      }

      const appointments = await Appointment.find({ hospitalId: hospital._id })
        .populate('patientId', 'name email phone')
        .populate('doctorId', 'name specialization')
        .sort({ appointmentDate: -1 })
        .limit(50);

      return NextResponse.json({ hospital, appointments });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}