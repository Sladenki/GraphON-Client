import { NextRequest, NextResponse } from 'next/server';

/**
 * Dev Auth API Route
 * 
 * Позволяет авторизоваться локально без Telegram для разработки и тестирования.
 * Работает ТОЛЬКО в dev режиме.
 * 
 * Поддерживает:
 * - Авторизацию с моковыми данными пользователя
 * - Выбор роли пользователя для тестирования
 * - Создание тестовых пользователей с разными правами
 */

const DEV_USERS = {
  admin: {
    _id: 'dev-admin-user-id',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    username: 'admin-dev',
    avaPath: '',
    telegramId: 'dev-admin-telegram',
    email: 'admin@dev.local',
    selectedGraphId: null,
    universityGraphId: null,
    isStudent: null,
    graphSubsNum: 5,
    postsNum: 10,
    attentedEventsNum: 3,
  },
  creator: {
    _id: 'dev-creator-user-id',
    role: 'create',
    firstName: 'Creator',
    lastName: 'User',
    username: 'creator-dev',
    avaPath: '',
    telegramId: 'dev-creator-telegram',
    email: 'creator@dev.local',
    selectedGraphId: null,
    universityGraphId: null,
    isStudent: null,
    graphSubsNum: 3,
    postsNum: 7,
    attentedEventsNum: 2,
  },
  student: {
    _id: 'dev-student-user-id',
    role: 'user',
    firstName: 'Student',
    lastName: 'User',
    username: 'student-dev',
    avaPath: '',
    telegramId: 'dev-student-telegram',
    email: 'student@dev.local',
    selectedGraphId: null,
    universityGraphId: null,
    isStudent: true,
    graphSubsNum: 2,
    postsNum: 1,
    attentedEventsNum: 5,
  },
  user: {
    _id: 'dev-user-id',
    role: 'user',
    firstName: 'Regular',
    lastName: 'User',
    username: 'user-dev',
    avaPath: '',
    telegramId: 'dev-user-telegram',
    email: 'user@dev.local',
    selectedGraphId: null,
    universityGraphId: null,
    isStudent: false,
    graphSubsNum: 1,
    postsNum: 0,
    attentedEventsNum: 1,
  },
} as const;

type DevUserRole = keyof typeof DEV_USERS;

export async function POST(req: NextRequest) {
  const status = process.env.NEXT_CLIENT_STATUS;
  
  // Разрешаем только в dev режиме
  if (status !== 'dev') {
    return NextResponse.json(
      { error: 'Dev auth is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { 
      role = 'user',
      isStudent,
      selectedGraphId,
      universityGraphId,
    } = body as { 
      role?: DevUserRole;
      isStudent?: boolean | null;
      selectedGraphId?: string | null;
      universityGraphId?: string | null;
    };

    // Проверяем, что роль валидна
    if (!DEV_USERS[role as DevUserRole]) {
      return NextResponse.json(
        { error: `Invalid role. Available roles: ${Object.keys(DEV_USERS).join(', ')}` },
        { status: 400 }
      );
    }

    const baseUser = DEV_USERS[role as DevUserRole];
    
    // Обновляем данные пользователя на основе регистрации
    const devUser = {
      ...baseUser,
      isStudent: isStudent !== undefined ? isStudent : baseUser.isStudent,
      selectedGraphId: selectedGraphId || baseUser.selectedGraphId,
      universityGraphId: universityGraphId || (isStudent && selectedGraphId ? selectedGraphId : baseUser.universityGraphId),
    };
    
    // Генерируем простой токен для dev режима
    // В реальном приложении это должен быть JWT токен от бэкенда
    const devToken = `dev-token-${role}-${Date.now()}`;

    // Сохраняем токен в cookie для совместимости с существующей системой
    const response = NextResponse.json({
      accessToken: devToken,
      user: devUser,
    });

    // Устанавливаем cookie для совместимости
    response.cookies.set('accessToken', devToken, {
      httpOnly: false, // Для dev режима разрешаем доступ из JS
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 дней
    });

    return response;
  } catch (error: any) {
    console.error('Dev auth error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint для получения списка доступных ролей
export async function GET() {
  const status = process.env.NEXT_CLIENT_STATUS;
  
  if (status !== 'dev') {
    return NextResponse.json(
      { error: 'Dev auth is only available in development mode' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    availableRoles: Object.keys(DEV_USERS),
    users: DEV_USERS,
  });
}
