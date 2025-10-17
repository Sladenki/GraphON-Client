const nextConfig = {
  trailingSlash: true,

  // Разрешаем загрузку изображений с любого домена 
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },

  reactStrictMode: true, // Включает строгий режим React

  // Отключаем source maps в продакшене для уменьшения размера билда
  productionBrowserSourceMaps: false,

  // Убираем X-Powered-By header для безопасности
  poweredByHeader: false,

  // Удаляем console.log в production (оставляем error и warn)
  compiler: {
    removeConsole: process.env.NEXT_CLIENT_STATUS === 'prod' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Оптимизация импортов: загружаем только используемые иконки
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

  experimental: {
    turbo: {
      enabled: true, // Включаем Turbopack
    },
    
    // --- Время сборки ---

    // Параллельная компиляция для ускорения сборки
    webpackBuildWorker: true,
    
    // Оптимизация памяти при сборке
    memoryBasedWorkersCount: true,
    
    // Автоматическая оптимизация импортов из больших библиотек
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      'lodash',
      'date-fns',
    ],
  },
  
};

export default nextConfig;
