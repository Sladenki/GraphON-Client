import { NextResponse } from 'next/server';

export async function GET() {
  // Используем NEXT_CLIENT_STATUS (без NEXT_PUBLIC_) - она доступна только на сервере
  // и НЕ встраивается в клиентский бандл
  const status = process.env.NEXT_CLIENT_STATUS;
  const isDev = status === 'dev';
  
  return NextResponse.json({ isDev });
}
