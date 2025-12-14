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

    const body = await req.json().catch(() => ({}));
    const { createNew = false } = body as { createNew?: boolean };

    // Используем специальный dev-код для локальной авторизации
    // 'dev-local-login' - возвращает существующего тестового пользователя
    // 'dev-create-user' - создает нового пользователя (для регистрации)
    const devCode = createNew ? 'dev-create-user' : 'dev-local-login';
    
    // Бэкенд должен обработать этот код:
    // - 'dev-local-login' - вернуть существующего тестового пользователя
    // - 'dev-create-user' - создать нового пользователя и вернуть его
    const response = await fetch(`${apiUrl}/auth/exchange-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: devCode }),
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
