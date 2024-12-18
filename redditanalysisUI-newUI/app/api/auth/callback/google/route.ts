import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect('/login?error=NoCodeProvided');
    }

    // Exchange code for token with backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.redirect(`/login?error=${error.detail || 'LoginFailed'}`);
    }

    const data = await response.json();
    
    // Set cookies/local storage
    const headers = new Headers();
    headers.append('Set-Cookie', `token=${data.access_token}; Path=/; HttpOnly; SameSite=Lax`);
    headers.append('Set-Cookie', `userEmail=${data.email}; Path=/; HttpOnly; SameSite=Lax`);

    // Redirect to projects page
    return NextResponse.redirect('/projects', {
      headers,
    });
  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.redirect('/login?error=ServerError');
  }
}
