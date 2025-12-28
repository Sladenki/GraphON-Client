"use client";

import React from "react";
import styles from "./MobileBottomNav.module.scss";
import Link from "next/link";
import { Newspaper, UserPlus, User, Shield } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { UserRole } from "@/types/user.interface";
import CentralActionButton from "../CentralActionButton/CentralActionButton";

const MobileBottomNav: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width: 1000px)');

  if (!isMobile) return null;

  // Проверка доступа к админке
  const hasAdminAccess = isLoggedIn && user && user.role !== UserRole.User;

  const isActive = (path: string) => pathname === path || pathname.startsWith(path);

  return (
    <>
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
                <User size={18} strokeWidth={1.5} />
              </span>
              <span className={styles.srOnly}>Профиль</span>
            </Link>
          </li>

          {/* АДМИНКА */}
          {hasAdminAccess && (
          <li className={styles.navItem}>
              <Link 
                href="/admin/" 
                className={`${styles.navLink} ${isActive('/admin') ? styles.active : ""}`} 
                aria-label="Админка" 
                aria-current={isActive('/admin') ? "page" : undefined}
            >
              <span className={styles.iconWrapper}>
                  <Shield size={18} strokeWidth={1.5} />
              </span>
                <span className={styles.srOnly}>Админка</span>
              </Link>
          </li>
          )}
        </ul>
      </nav>
    </>
  );
};

export default MobileBottomNav;

