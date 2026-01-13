import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BloodBankAvailability from '@/models/BloodBankAvailability';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const bloodGroup = searchParams.get('bloodGroup');
    
    let filter: any = {};
    
    if (location) {
      filter.district = { $regex: location, $options: 'i' };
    }
    
    let bloodBanks = await BloodBankAvailability.find(filter)
      .sort({ district: 1, bloodBankName: 1 })
      .limit(50);
    
    // Filter by blood group if specified
    if (bloodGroup && bloodBanks.length > 0) {
      bloodBanks = bloodBanks.filter(bank => 
        bank.bloodGroups[bloodGroup] && bank.bloodGroups[bloodGroup] > 0
      );
    }
    
    return NextResponse.json({ 
      bloodBanks,
      total: bloodBanks.length,
      lastUpdated: bloodBanks[0]?.lastUpdated || null
    });
    
  } catch (error) {
    console.error('Blood availability API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch blood availability data' 
    }, { status: 500 });
  }
}