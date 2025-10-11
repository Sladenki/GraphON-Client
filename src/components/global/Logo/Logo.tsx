import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import styles from './Logo.module.scss'

interface LogoProps {
  /**
   * Ширина логотипа
   */
  width?: number
  /**
   * Высота логотипа
   */
  height?: number
  /**
   * URL для перехода при клике (по умолчанию '/')
   */
  href?: string
  /**
   * Использовать ли обертку Link (по умолчанию true)
   */
  clickable?: boolean
  /**
   * Приоритет загрузки изображения
   */
  priority?: boolean
  /**
   * Дополнительный CSS класс
   */
  className?: string
}

export const Logo: React.FC<LogoProps> = ({
  width = 130,
  height = 20,
  href = '/events',
  clickable = true,
  priority = true,
  className = ''
}) => {
  const { theme } = useTheme()
  
  const logoSrc = theme === 'dark' ? '/logo_darkMode.svg' : '/logo_lightMode.svg'

  const logoImage = (
    <Image
      src={logoSrc}
      alt="GraphON Logo"
      width={width}
      height={height}
      className={`${styles.logo} ${className}`}
      priority={priority}
    />
  )

  if (!clickable) {
    return logoImage
  }

  return (
    <Link href={href} className={styles.logoLink}>
      {logoImage}
    </Link>
  )
}

