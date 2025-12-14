import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const password = String(body?.password ?? '');

  const status = process.env.NEXT_PUBLIC_CLIENT_STATUS;
  const expected = process.env.NEXT_MONGO_ACCESS_PASSWORD;

  if (status !== 'prod') {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (!expected) {
    return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });
  }

  if (password !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set('mongo_auth', '1', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 12 });
  return res;
}

export async function GET(req: NextRequest) {
  const status = process.env.NEXT_PUBLIC_CLIENT_STATUS;
  const hasCookie = req.cookies.get('mongo_auth')?.value === '1';
  const mustAskPassword = status === 'prod' && !hasCookie;
  return NextResponse.json({ mustAskPassword });
}


