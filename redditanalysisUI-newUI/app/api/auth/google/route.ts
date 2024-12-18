import { NextResponse } from 'next/server';
import { useAuthStore } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { credential } = await request.json();
    console.log('Received credential from frontend:', credential?.substring(0, 20) + '...');

    if (!credential) {
      throw new Error('No credential provided');
    }

    // Create URL with query parameter
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/auth/google-login`);
    url.searchParams.append('token', credential);

    console.log('Sending request to:', url.toString());

    // Call your backend API to verify the Google token
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend response status:', response.status);
    const responseData = await response.json();
    console.log('Backend response data:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      const errorDetail = typeof responseData.detail === 'object'
        ? JSON.stringify(responseData.detail)
        : responseData.detail || 'Authentication failed';
      
      console.error('Backend error:', {
        status: response.status,
        detail: errorDetail
      });

      return NextResponse.json(
        { error: errorDetail },
        { status: response.status }
      );
    }
    
    if (!responseData.email && !responseData.user?.email) {
      throw new Error('No email in response data');
    }

    if (!responseData.access_token && !responseData.token) {
      throw new Error('No token in response data');
    }

    // Make sure we return the data in the format our frontend expects
    const userData = {
      email: responseData.email || responseData.user?.email,
      token: responseData.access_token || responseData.token,
    };

    console.log('Returning user data:', {
      ...userData,
      token: userData.token.substring(0, 20) + '...'
    });

    return NextResponse.json(userData);
  } catch (error: any) {
    console.error('Google auth error:', {
      message: error.message,
      error: error
    });

    const errorMessage = error.message || (typeof error === 'object' ? JSON.stringify(error) : 'Authentication failed');
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    );
  }
}
