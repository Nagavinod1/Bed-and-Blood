import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    console.log('🩸 Starting eRaktKosh data sync...');
    
    // Run the scraper script
    const { stdout, stderr } = await execAsync('npx tsx scripts/eraktkoshScraper.ts', {
      cwd: process.cwd(),
      timeout: 300000 // 5 minutes timeout
    });
    
    console.log('Scraper output:', stdout);
    if (stderr) console.error('Scraper errors:', stderr);
    
    return NextResponse.json({ 
      message: 'Blood availability data synced successfully',
      output: stdout
    });
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
    return NextResponse.json({ 
      error: 'Failed to sync blood availability data',
      details: (error as any).message
    }, { status: 500 });
  }
}