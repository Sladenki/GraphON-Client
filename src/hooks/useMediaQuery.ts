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

// import { useEffect, useState } from 'react'

// export const getWindowWidth = () => {
//   const { innerWidth: windowWidth } =
//     typeof window !== 'undefined' ? window : { innerWidth: 0 }

//   return { windowWidth }
// }

// const useWindowWidth = () => {
//   const [windowWidth, setWindowWidth] = useState(getWindowWidth())

//   const handleResize = () => setWindowWidth(getWindowWidth())

//   useEffect(() => {
//     window.addEventListener('resize', handleResize, true)

//     return () => window.removeEventListener('resize', handleResize, true)
//   }, [])

//   return { windowWidth, handleResize }
// }

// export const useMediaQuery = (maxWidth: number) => {
//   const {
//     windowWidth: { windowWidth },
//     handleResize,
//   } = useWindowWidth()
//   const [isMedia, setIsMedia] = useState(false)

//   useEffect(() => {
//     if (windowWidth <= maxWidth) {
//       setIsMedia(true)
//     } else {
//       setIsMedia(false)
//     }
//   }, [handleResize, maxWidth, windowWidth])

//   return isMedia
// }