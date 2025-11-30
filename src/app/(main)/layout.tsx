'use client'

import { useState, useEffect } from 'react';
import Sidebar from "@/components/global/Sidebar/Sidebar";
import styles from './layout.module.scss'
import BottomMenu from "@/components/global/BottomMenu/BottomMenu";
import MobileDrawer from "@/components/global/MobileDrawer/MobileDrawer";
import TopPanel from "@/components/global/TopPanel/TopPanel";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Toaster } from "sonner";
import { HeroUIProvider } from "@heroui/react";
import { UniversitySelect } from '@/components/global/UniversitySelect/UniversitySelect';
import { useSelectedGraphId, useSetSelectedGraphId } from '@/stores/useUIStore';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { useAuth } from '@/providers/AuthProvider';

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {

  const small = useMediaQuery('(max-width: 1000px)')
  const selectedGraphId = useSelectedGraphId();
  const setSelectedGraphId = useSetSelectedGraphId();
  const { user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);

  // Ждем пока Zustand загрузит данные из localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Синхронизируем selectedGraphId из данных пользователя
  useEffect(() => {
    if (!isHydrated) return;
    
    // Нормализуем selectedGraphId из объекта пользователя
    const normalizeGraphId = (raw: any): string | null => {
      if (!raw) return null;
      if (typeof raw === 'string') return raw;
      if (typeof raw === 'object') {
        return raw._id ?? raw.$oid ?? null;
      }
      return null;
    };

    const userSelectedGraphId = normalizeGraphId(user?.selectedGraphId);

    // Если пользователь авторизован и у него нет selectedGraphId в объекте, 
    // но в store есть старое значение - очищаем store, чтобы показать окно выбора
    if (user && !userSelectedGraphId && selectedGraphId) {
      setSelectedGraphId(null);
    } 
    // Если в объекте пользователя есть selectedGraphId, но в store нет или отличается - обновляем store
    else if (user && userSelectedGraphId && userSelectedGraphId !== selectedGraphId) {
      setSelectedGraphId(userSelectedGraphId);
    }
    // Если пользователь не авторизован, ничего не делаем - полагаемся на значение из localStorage
  }, [user, selectedGraphId, setSelectedGraphId, isHydrated]);

  // Показываем лоадер пока загружаются данные из localStorage
  if (!isHydrated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--background-color)'
      }}>
        <SpinnerLoader />
      </div>
    );
  }

  return (
    <HeroUIProvider>
      <Toaster position="top-right" richColors />

      {/* Если университет не выбран - показываем экран выбора */}
      {!selectedGraphId ? (
        <div className={styles.universitySelectWrapper}>
          <UniversitySelect />
        </div>
      ) : (
        <div className={styles.wrapper}>
          {/* Top Panel - только для мобильных */}
          {small && <TopPanel />}

          {/* Mobile Drawer - только для мобильных */}
          {small ? (
            <MobileDrawer>
              <div className={styles.main}>
                <div className={styles.content}>
                  {children}
                </div>
              </div>
            </MobileDrawer>
          ) : (
            <>
              {/* Sidebar - только для десктопа */}
              <div className={styles.sidebar}>
                <Sidebar/>
              </div>
              
              {/* Основная страница */}
              <div className={styles.main}>
                <div className={styles.content}>
                  {children}
                </div>
              </div>
            </>
          )}

          <div className={styles.BottomMenu}>
            <BottomMenu/>
          </div>
        </div>
      )}
    </HeroUIProvider>
  );
}