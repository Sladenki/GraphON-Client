'use client'

import React from 'react'
import { useTheme } from 'next-themes';

import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';

import styles from './Settings.module.scss'
import { useRouter } from 'next/navigation';


const Settings = () => {
  const { push } = useRouter();

  const { setTheme, theme } = useTheme();
  const { logout } = useAuth();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    await logout();
    push("/"); // Перенаправление на главную страницу после выхода
  };


  return (
    <div className={styles.settingsWrapper}>
      <div className={styles.themeSwitchWrapper}>
        <span className={styles.themeLabel}>Тема:</span>
        <label className={styles.themeSwitch}>
          <input type="checkbox" onChange={toggleTheme} checked={theme === "dark"} />
          <span className={styles.slider}></span>
        </label>
      </div>

      <Link href="#" onClick={handleLogout} className={styles.logoutLink}>
        Выйти
      </Link>
    </div>
  )
}

export default Settings