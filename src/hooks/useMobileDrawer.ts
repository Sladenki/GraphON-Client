'use client'

import { useState, useCallback } from 'react'

interface UseMobileDrawerReturn {
  isOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
}

export const useMobileDrawer = (): UseMobileDrawerReturn => {
  const [isOpen, setIsOpen] = useState(false)

  const openDrawer = useCallback(() => {
    setIsOpen(true)
    // Блокируем скролл body
    document.body.style.overflow = 'hidden'
  }, [])

  const closeDrawer = useCallback(() => {
    setIsOpen(false)
    // Разблокируем скролл body
    document.body.style.overflow = ''
  }, [])

  const toggleDrawer = useCallback(() => {
    if (isOpen) {
      closeDrawer()
    } else {
      openDrawer()
    }
  }, [isOpen, openDrawer, closeDrawer])

  return {
    isOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer
  }
}
