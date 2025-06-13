import React from 'react';
import { Moon, Sun } from 'lucide-react';

import styles from './ThemeToggle.module.scss';
import { useTheme } from 'next-themes';


interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, size = 'md' }) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className={`${styles.themeSwitchWrapper} ${styles[size]} ${className || ''}`}>
      <span className={styles.themeLabel}>
        {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
      </span>
      <label className={styles.themeSwitch}>
        <input 
          type="checkbox" 
          onChange={toggleTheme} 
          checked={theme === "light"} 
        />
        <span className={styles.slider}></span>
      </label>
    </div>
  );
};

export default ThemeToggle; 