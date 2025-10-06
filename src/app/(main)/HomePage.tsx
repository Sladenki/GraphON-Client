'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/providers/AuthProvider'
import styles from './HomePage.module.scss'

interface HomeBlockProps {
  title: string
  description: string
  href: string
  icon: string
  color: string
}


export default function HomePage() {
  const { user } = useAuth()
  const isAuthenticated = !!user

  return (
    <div className={styles.container}>
      HomePage
    </div>
  )
}
