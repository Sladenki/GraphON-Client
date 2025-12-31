"use client";

import React, { useState, useEffect } from "react";
import styles from "./MobileBottomNav.module.scss";
import Link from "next/link";
import { Newspaper, UserPlus, CircleUser, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import CentralActionButton from "../CentralActionButton/CentralActionButton";

const MobileBottomNav: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width: 1000px)');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Запускаем анимацию после монтирования компонента
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50); // Небольшая задержка для плавности

    return () => clearTimeout(timer);
  }, []);

  if (!isMobile) return null;

  const isActive = (path: string) => pathname === path || pathname.startsWith(path);

  return (
    <>
      <div className={`${styles.navContainer} ${isVisible ? styles.visible : ''}`}>
        <nav className={styles.bottomNav} role="navigation" aria-label="Bottom navigation">
          <ul className={styles.navList}>
            {/* СОБЫТИЯ */}
            <li className={styles.navItem}>
              <Link 
                href="/events/" 
                className={`${styles.navLink} ${isActive('/events') ? styles.active : ""}`} 
                aria-label="События" 
                aria-current={isActive('/events') ? "page" : undefined}
              >
                <span className={styles.iconWrapper}>
                  <Newspaper size={18} strokeWidth={1.5} />
                </span>
                <span className={styles.srOnly}>События</span>
              </Link>
            </li>

            {/* ДРУЗЬЯ */}
            <li className={styles.navItem}>
              <Link 
                href="/friends" 
                className={`${styles.navLink} ${isActive('/friends') ? styles.active : ""}`} 
                aria-label="Друзья" 
                aria-current={isActive('/friends') ? "page" : undefined}
              >
                <span className={styles.iconWrapper}>
                  <UserPlus size={18} strokeWidth={1.5} />
                </span>
                <span className={styles.srOnly}>Друзья</span>
              </Link>
            </li>

            {/* Центральная кнопка */}
            <li className={styles.navItem}>
              <div className={styles.centralButtonWrapper}>
                <CentralActionButton />
              </div>
            </li>

            {/* ПРОФИЛЬ */}
            <li className={styles.navItem}>
              <Link 
                href="/profile" 
                className={`${styles.navLink} ${isActive('/profile') ? styles.active : ""}`} 
                aria-label="Профиль" 
                aria-current={isActive('/profile') ? "page" : undefined}
              >
                <span className={styles.iconWrapper}>
                  <CircleUser size={18} strokeWidth={1.5} />
                </span>
                <span className={styles.srOnly}>Профиль</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Кнопка создания справа от меню */}
        {isLoggedIn && (
          <Link 
            href="/admin/" 
            className={`${styles.adminButton} ${isActive('/admin') ? styles.adminButtonActive : ""}`}
            aria-label="Создать"
            aria-current={isActive('/admin') ? "page" : undefined}
          >
            <Plus size={18} strokeWidth={2.5} />
          </Link>
        )}
      </div>
    </>
  );
};

export default MobileBottomNav;

