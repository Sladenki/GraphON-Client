import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Используем NEXT_CLIENT_STATUS (без NEXT_PUBLIC_) - она доступна только на сервере
  // и НЕ встраивается в клиентский бандл. Это безопасная проверка.
  const status = process.env.NEXT_CLIENT_STATUS;
  
  // Разрешаем только в dev режиме
  if (status !== 'dev') {
    return NextResponse.json(
      { error: 'Dev login is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!apiUrl) {
      return NextResponse.json(
        { error: 'API URL is not configured' },
        { status: 500 }
      );
    }

    // Используем специальный dev-код для локальной авторизации
    // Бэкенд должен обработать этот код и вернуть тестового пользователя
    const response = await fetch(`${apiUrl}/auth/exchange-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: 'dev-local-login' }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to login' }));
      return NextResponse.json(
        { error: error.message || 'Failed to login' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Dev login error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
