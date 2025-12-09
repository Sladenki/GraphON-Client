export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Обрабатываем unhandledRejection для предотвращения ошибок Inspector
    process.on('unhandledRejection', (reason, promise) => {
      // Игнорируем ошибки Inspector
      if (reason && typeof reason === 'object' && 'code' in reason && reason.code === 'ERR_INSPECTOR_NOT_AVAILABLE') {
        // Игнорируем эту ошибку
        return;
      }
      // Для других ошибок можно добавить логирование или другую обработку
      console.error('Unhandled Rejection:', reason);
    });
  }
}

