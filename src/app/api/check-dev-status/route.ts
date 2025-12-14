import { NextResponse } from 'next/server';

export async function GET() {
  const status = process.env.NEXT_PUBLIC_CLIENT_STATUS;
  const isDev = status === 'dev';
  
  return NextResponse.json({ isDev });
}
