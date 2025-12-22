"use client";

import React, { useState } from "react";
import styles from "./MobileBottomNav.module.scss";
import Link from "next/link";
import { Newspaper, Heart, Users, MoreHorizontal } from "lucide-react";
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

  return (
    <>
      <nav className={styles.bottomNav} role="navigation" aria-label="Bottom navigation">
        <ul className={styles.navList}>
          {/* Мероприятия */}
          <li className={styles.navItem}>
            <Link 
              href="/events/" 
              className={`${styles.navLink} ${pathname === '/events/' ? styles.active : ""}`} 
              aria-label="Мероприятия" 
              aria-current={pathname === '/events/' ? "page" : undefined}
            >
              <span className={styles.iconWrapper}>
                <Newspaper size={18} strokeWidth={1.5} />
              </span>
              <span className={styles.srOnly}>Мероприятия</span>
            </Link>
          </li>

          {/* Подписки */}
          <li className={styles.navItem}>
            <Link 
              href="/subs/" 
              className={`${styles.navLink} ${pathname === '/subs/' ? styles.active : ""}`} 
              aria-label="Подписки" 
              aria-current={pathname === '/subs/' ? "page" : undefined}
            >
              <span className={styles.iconWrapper}>
                <Heart size={18} strokeWidth={1.5} />
              </span>
              <span className={styles.srOnly}>Подписки</span>
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
              className={`${styles.navLink} ${pathname === '/groups/' ? styles.active : ""}`} 
              aria-label="Группы" 
              aria-current={pathname === '/groups/' ? "page" : undefined}
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

