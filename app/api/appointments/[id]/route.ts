import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Appointment from '@/models/Appointment';
import Hospital from '@/models/Hospital';
import Notification from '@/models/Notification';
import { verifyToken } from '@/lib/jwt';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params;
    const { status, notes } = await request.json();

    const hospital = await Hospital.findOne({ userId: decoded.userId });
    if (!hospital) {
      return NextResponse.json({ error: 'Hospital profile not found' }, { status: 404 });
    }

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, hospitalId: hospital._id },
      { status, notes },
      { new: true }
    ).populate('patientId', 'name');

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Create notification for patient
    const notificationMessages = {
      confirmed: 'Your appointment has been confirmed',
      rejected: 'Your appointment has been rejected',
      completed: 'Your appointment has been completed'
    };

    if (notificationMessages[status as keyof typeof notificationMessages]) {
      await Notification.create({
        userId: appointment.patientId._id,
        title: 'Appointment Update',
        message: notificationMessages[status as keyof typeof notificationMessages],
        type: 'appointment',
        data: { appointmentId: appointment._id }
      });
    }

    return NextResponse.json({ message: 'Appointment updated successfully', appointment });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}