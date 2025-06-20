import React, { useCallback, useMemo } from 'react';
import { Moon, Sun } from 'lucide-react';

import styles from './ThemeToggle.module.scss';
import { useTheme } from 'next-themes';


interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = React.memo(({ className, size = 'md' }) => {
  const { theme, setTheme } = useTheme();

  // Мемоизируем функцию переключения темы
  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  // Мемоизируем размер иконки в зависимости от размера компонента
  const iconSize = useMemo(() => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 24;
      default: return 20;
    }
  }, [size]);

  // Мемоизируем класснейм
  const wrapperClassName = useMemo(() => 
    `${styles.themeSwitchWrapper} ${styles[size]} ${className || ''}`,
    [size, className]
  );

  // Мемоизируем иконку
  const themeIcon = useMemo(() => 
    theme === 'dark' ? <Moon size={iconSize} /> : <Sun size={iconSize} />,
    [theme, iconSize]
  );

  return (
    <div className={wrapperClassName}>
      <span className={styles.themeLabel}>
        {themeIcon}
      </span>
      <label className={styles.themeSwitch}>
        <input 
          type="checkbox" 
          onChange={toggleTheme} 
          checked={theme === "light"}
          // Отключаем автофокус на мобильных для предотвращения виртуальной клавиатуры
          autoFocus={false}
        />
        <span className={styles.slider}></span>
      </label>
    </div>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle; 