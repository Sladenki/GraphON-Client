"use client";

import React, { useState, useEffect } from "react";
import styles from "./MobileBottomNav.module.scss";
import Link from "next/link";
import { Newspaper, UserPlus, CircleUser, Plus, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import MorePopup from "../MorePopup/MorePopup";
import GraphSwitcherIcon from "../GraphSwitcherIcon/GraphSwitcherIcon";
import { CITY_GRAPH_ID, CITY_ROUTE, GRAPHS_ROUTE } from '@/constants/sidebar';
import { useSelectedGraphId } from "@/stores/useUIStore";
import { Network, MapPinned } from 'lucide-react';

const MobileBottomNav: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width: 1000px)');
  const [isVisible, setIsVisible] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const storeSelectedGraphId = useSelectedGraphId();
  const router = useRouter();

  useEffect(() => {
    // Запускаем анимацию после монтирования компонента
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50); // Небольшая задержка для плавности

    return () => clearTimeout(timer);
  }, []);

  if (!isMobile) return null;

  const isActive = (path: string) => pathname === path || pathname.startsWith(path);

  const normalizeGraphId = (raw: any): string | null => {
    if (!raw) return null;
    if (typeof raw === 'string') return raw;
    if (typeof raw === 'object') {
      return raw._id ?? raw.$oid ?? null;
    }
    return null;
  };

  const effectiveGraphId = storeSelectedGraphId || normalizeGraphId(user?.selectedGraphId);
  const isCityGraph = effectiveGraphId === CITY_GRAPH_ID;
  const targetPath = isCityGraph ? CITY_ROUTE : GRAPHS_ROUTE;
  const isActiveCentral = pathname === targetPath;

  const handleClick = () => {
    router.push(targetPath);
  };

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
              {/* <div className={styles.centralButtonWrapper}>
                <CentralActionButton />
              </div> */}

              <button 
                    className={`${styles.navLink} ${isActiveCentral ? styles.active : ''}`}
                    onClick={handleClick}
                    aria-label={isCityGraph ? 'Город' : 'Графы'}
                  >
                    <div className={styles.iconWrapper}>
                      {isCityGraph ? (
                        <MapPinned size={18} strokeWidth={1.5} />
                      ) : (
                        <Network size={18} strokeWidth={1.5} />
                      )}
                    </div>
                  </button>
            </li>

            {/* НАСТРОЙКИ (крайняя правая кнопка в меню) */}
            <li className={styles.navItem}>
              <button 
                type="button"
                className={`${styles.navLink} ${isMoreOpen ? styles.active : ""}`}
                aria-label="Настройки"
                onClick={() => setIsMoreOpen(true)}
              >
                <span className={styles.iconWrapper}>
                  <Settings size={18} strokeWidth={1.5} />
                </span>
                <span className={styles.srOnly}>Настройки</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Выбор графа (иконка) справа от меню */}
        {isLoggedIn && (
          <div className={styles.graphSwitcherIcon}>
            <GraphSwitcherIcon />
          </div>
        )}
      </div>
      {/* Popup "Еще" */}
      <MorePopup isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
    </>
  );
};

export default MobileBottomNav;

