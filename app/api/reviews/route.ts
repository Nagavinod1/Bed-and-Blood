import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';
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
    if (!decoded || decoded.role !== 'patient') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hospitalId, rating, comment } = await request.json();

    const review = await Review.create({
      patientId: decoded.userId,
      hospitalId,
      rating,
      comment
    });

    // Update hospital rating
    const reviews = await Review.find({ hospitalId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await Hospital.findByIdAndUpdate(hospitalId, {
      rating: avgRating,
      totalReviews: reviews.length
    });

    return NextResponse.json({ message: 'Review submitted successfully', review });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get('hospitalId');

    if (!hospitalId) {
      return NextResponse.json({ error: 'Hospital ID required' }, { status: 400 });
    }

    const reviews = await Review.find({ hospitalId })
      .populate('patientId', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}