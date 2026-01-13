import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Appointment from '@/models/Appointment';
import Hospital from '@/models/Hospital';
import Notification from '@/models/Notification';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'patient') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hospitalId, doctorId, appointmentDate, timeSlot, symptoms } = await request.json();

    const appointment = await Appointment.create({
      patientId: decoded.userId,
      hospitalId,
      doctorId,
      appointmentDate,
      timeSlot,
      symptoms
    });

    // Create notification for hospital admin
    const hospital = await Hospital.findById(hospitalId);
    if (hospital) {
      await Notification.create({
        userId: hospital.userId,
        title: 'New Appointment Booked',
        message: 'A new appointment has been booked at your hospital',
        type: 'appointment',
        data: { appointmentId: appointment._id }
      });
    }

    return NextResponse.json({ message: 'Appointment booked successfully', appointment });
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const search = searchParams.get('search');

    let appointments;
    if (decoded.role === 'patient') {
      let filter: any = { patientId: decoded.userId };
      if (status) filter.status = status;
      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        filter.appointmentDate = { $gte: startDate, $lt: endDate };
      }
      
      appointments = await Appointment.find(filter)
        .populate('hospitalId', 'name')
        .populate('doctorId', 'name specialization')
        .sort({ appointmentDate: -1 });
    } else {
      const hospital = await Hospital.findOne({ userId: decoded.userId });
      if (!hospital) {
        return NextResponse.json({ error: 'Hospital profile not found' }, { status: 404 });
      }
      
      let filter: any = { hospitalId: hospital._id };
      if (status) filter.status = status;
      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        filter.appointmentDate = { $gte: startDate, $lt: endDate };
      }
      
      appointments = await Appointment.find(filter)
        .populate('patientId', 'name email phone')
        .populate('doctorId', 'name specialization')
        .sort({ appointmentDate: -1 });
        
      // Filter by patient name if search provided
      if (search) {
        appointments = appointments.filter(apt => 
          apt.patientId.name.toLowerCase().includes(search.toLowerCase())
        );
      }
    }

    return NextResponse.json({ appointments });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}