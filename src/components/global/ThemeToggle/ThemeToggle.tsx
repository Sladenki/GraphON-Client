import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import styles from './ThemeToggle.module.scss';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ICON_SIZES = {
  sm: 16,
  md: 20,
  lg: 24
} as const;

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, size = 'md' }) => {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    // Используем функциональный апдейт - не зависит от текущего theme
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const iconSize = ICON_SIZES[size];
  const isDark = theme === 'dark';

  return (
    <div className={`${styles.themeSwitchWrapper} ${styles[size]} ${className || ''}`}>
      <span className={styles.themeLabel}>
        {isDark ? <Moon size={iconSize} /> : <Sun size={iconSize} />}
        <span>{isDark ? 'Темная' : 'Светлая'}</span>
      </span>
      
      <label className={styles.themeSwitch}>
        <input 
          type="checkbox" 
          onChange={toggleTheme} 
          checked={!isDark}
          aria-label="Переключить тему"
        />
        <span className={styles.slider} />
      </label>
    </div>
  );
};

export default ThemeToggle;
