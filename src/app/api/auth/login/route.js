import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    console.log('🔐 Login attempt:', username);

    // Get IP address and User Agent
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'Unknown';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Simple authentication
    const validUsername = 'admin';
    const validPassword = 'admin123';

    const client = await clientPromise;
    const db = client.db('kalakruthi');

    if (username === validUsername && password === validPassword) {
      // Log successful login
      await db.collection('auth_logs').insertOne({
        username,
        action: 'login',
        status: 'success',
        ip,
        userAgent,
        timestamp: new Date(),
      });

      console.log('✅ Login successful:', username);

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        user: { username }
      });
    } else {
      // Log failed login
      await db.collection('auth_logs').insertOne({
        username,
        action: 'login',
        status: 'failed',
        ip,
        userAgent,
        timestamp: new Date(),
      });

      console.log('❌ Login failed:', username);

      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }
  } catch (error) {
    console.error('❌ Login Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}
