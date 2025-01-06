"use client";

import React from 'react'
import styles from './ProfilePopUp.module.scss'
import { useTheme } from 'next-themes';

import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';


const ProfilePopUp = () => {
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

export default ProfilePopUp
