import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Hospital from '@/models/Hospital';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const city = searchParams.get('city') || '';
    const specialization = searchParams.get('specialization') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? -1 : 1;

    let filter: any = {};
    
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { specialties: { $regex: query, $options: 'i' } },
        { address: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }
    
    if (specialization) {
      filter.specialties = { $regex: specialization, $options: 'i' };
    }

    let sortOptions: any = {};
    if (sortBy === 'rating') {
      sortOptions.rating = sortOrder;
    } else if (sortBy === 'name') {
      sortOptions.name = sortOrder;
    } else {
      sortOptions.createdAt = -1;
    }

    const hospitals = await Hospital.find(filter)
      .select('-userId')
      .sort(sortOptions)
      .limit(50);

    return NextResponse.json({ hospitals });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}