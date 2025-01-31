'use client'

import React from 'react'
import { useTheme } from 'next-themes';

import styles from './Settings.module.scss'

const LogOut = React.lazy(() => import('@/components/LogOut/LogOut'));

const Settings = () => {

  const { setTheme, theme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className={styles.settingsWrapper}>
      <div className={styles.themeSwitchWrapper}>
        <span className={styles.themeLabel}>Тема:</span>
        <label className={styles.themeSwitch}>
          <input type="checkbox" onChange={toggleTheme} checked={theme === "dark"} />
          <span className={styles.slider}></span>
        </label>

        <LogOut/>
      </div>
    </div>
  )
}

export default Settings