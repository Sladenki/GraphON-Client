'use client'

import React from 'react'
import { useTheme } from 'next-themes';

import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';

import styles from './Settings.module.scss'

const Settings = () => {
  const { setTheme } = useTheme()

  const darkTheme = () => {
    setTheme("dark");
  }
  function lightTheme() {
    setTheme("light");
  }

  const { logout } = useAuth();

  return (
    <div className={styles.ProfilePopUpWrapper}>
    <button onClick={() => lightTheme()}>Light</button>
    <button onClick={() => darkTheme()}>Dark</button>

    <Link href="#" onClick={() => logout()}>
      Sign Out
    </Link>
    </div>
  )
}

export default Settings