import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';

export async function POST(request) {
  try {
    const { username } = await request.json();
    
    console.log('🚪 Logout:', username);

    // Get IP address and User Agent
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'Unknown';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    const client = await clientPromise;
    const db = client.db('kalakruthi');

    // Log logout
    await db.collection('auth_logs').insertOne({
      username: username || 'Unknown',
      action: 'logout',
      status: 'success',
      ip,
      userAgent,
      timestamp: new Date(),
    });

    console.log('✅ Logout logged:', username);

    return NextResponse.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('❌ Logout Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}
