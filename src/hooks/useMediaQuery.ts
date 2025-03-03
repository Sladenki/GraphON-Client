import { useSyncExternalStore } from 'react'

// Подписка на изменения размера окна
const subscribe = (callback: () => void) => {
  window.addEventListener('resize', callback)
  return () => window.removeEventListener('resize', callback)
}

// Основной хук
export const useMediaQuery = (maxWidth: number) => {
  const windowWidth = useSyncExternalStore(
    subscribe,
    () => window.innerWidth, // Получение текущего состояния
    () => 1024 // Значение для серверного рендеринга
  )

  return windowWidth <= maxWidth
}
