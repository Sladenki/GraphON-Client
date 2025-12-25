import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const status = process.env.NEXT_CLIENT_STATUS;

  if (status !== 'dev') {
    return NextResponse.json(
      { error: 'Dev login is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return NextResponse.json({ error: 'API URL is not configured' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const userId = String(body?.userId ?? '').trim();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Preferred: dedicated backend endpoint for dev impersonation
    let response = await fetch(`${apiUrl}/auth/dev-login-as`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
      credentials: 'include',
    });

    // Fallback: backend can support exchange-code with additional userId
    if (!response.ok && (response.status === 404 || response.status === 405)) {
      response = await fetch(`${apiUrl}/auth/exchange-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'dev-login-as', userId }),
        credentials: 'include',
      });
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to login as user' }));
      return NextResponse.json(
        { error: error.message || error.error || 'Failed to login as user' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Dev login-as error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


