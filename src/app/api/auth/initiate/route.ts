import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { externalId } = body;
    
    if (!externalId) {
      return NextResponse.json(
        { error: 'externalId is required' },
        { status: 400 }
      );
    }

    const chatServerUrl = process.env.NEXT_PUBLIC_CHAT_SERVER_URL || 'https://chat-application-h0xp.onrender.com';
    const response = await axios.post(`${chatServerUrl}/api/v1/guests/initiate`, {
      apiKey: process.env.NEXT_PUBLIC_CHAT_API_KEY,
      apiKeySecret: process.env.CHAT_API_SECRET,
      metaData: { 
        externalId,
        // username: externalId,
        // displayName: externalId
      }
    });

    const { clientToken } = response.data.data;

    console.log('Client Token:', clientToken);

    return NextResponse.json({ clientToken });
  } catch (error: any) {
    console.error('Authentication error:', error.response?.data || error.message);
    
    return NextResponse.json(
      { 
        error: error.response?.data?.message || error.message || 'Authentication failed' 
      },
      { status: 500 }
    );
  }
}
