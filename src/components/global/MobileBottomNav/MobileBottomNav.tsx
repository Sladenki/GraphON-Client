"use client";

import React, { useState } from "react";
import styles from "./MobileBottomNav.module.scss";
import Link from "next/link";
import { Newspaper, Users, MoreHorizontal, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import CentralActionButton from "../CentralActionButton/CentralActionButton";
import MorePopup from "../MorePopup/MorePopup";

const MobileBottomNav: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width: 1000px)');
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  if (!isMobile) return null;

  const isActive = (path: string) => pathname === path || pathname.startsWith(path);

  return (
    <>
      <nav className={styles.bottomNav} role="navigation" aria-label="Bottom navigation">
        <ul className={styles.navList}>
          {/* Мероприятия */}
          <li className={styles.navItem}>
            <Link 
              href="/events/" 
              className={`${styles.navLink} ${isActive('/events') ? styles.active : ""}`} 
              aria-label="Мероприятия" 
              aria-current={isActive('/events') ? "page" : undefined}
            >
              <span className={styles.iconWrapper}>
                <Newspaper size={18} strokeWidth={1.5} />
              </span>
              <span className={styles.srOnly}>Мероприятия</span>
            </Link>
          </li>

          {/* Профиль */}
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

          {/* Центральная кнопка */}
          <li className={styles.navItem}>
            <div className={styles.centralButtonWrapper}>
              <CentralActionButton />
            </div>
          </li>

          {/* Группы */}
          <li className={styles.navItem}>
            <Link 
              href="/groups/" 
              className={`${styles.navLink} ${isActive('/groups') ? styles.active : ""}`} 
              aria-label="Группы" 
              aria-current={isActive('/groups') ? "page" : undefined}
            >
              <span className={styles.iconWrapper}>
                <Users size={18} strokeWidth={1.5} />
              </span>
              <span className={styles.srOnly}>Группы</span>
            </Link>
          </li>

          {/* Еще */}
          <li className={styles.navItem}>
            <button
              className={`${styles.navLink} ${styles.moreButton} ${isMoreOpen ? styles.active : ""}`}
              onClick={() => setIsMoreOpen(true)}
              aria-label="Еще"
            >
              <span className={styles.iconWrapper}>
                <MoreHorizontal size={18} strokeWidth={1.5} />
              </span>
              <span className={styles.srOnly}>Еще</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Popup "Еще" */}
      <MorePopup isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
    </>
  );
};

export default MobileBottomNav;

