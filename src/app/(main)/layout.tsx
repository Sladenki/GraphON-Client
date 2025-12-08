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
import StudentStatusDialog from '@/components/global/StudentStatusDialog/StudentStatusDialog';
import { NON_STUDENT_DEFAULT_GRAPH_ID } from '@/constants/nonStudentDefaults';

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {

  const small = useMediaQuery('(max-width: 1000px)')
  const selectedGraphId = useSelectedGraphId();
  const setSelectedGraphId = useSetSelectedGraphId();
  const { user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [localIsStudent, setLocalIsStudent] = useState<boolean | null | undefined>(undefined);

  // Ждем пока Zustand загрузит данные из localStorage
  useEffect(() => {
    setIsHydrated(true);
    
    // Загружаем isStudent из localStorage для неавторизованных пользователей
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('isStudent');
      if (stored !== null) {
        setLocalIsStudent(stored === 'true');
      }
    }
  }, []);

  // Назначаем дефолтный selectedGraphId для гостей, выбравших статус "не студент"
  // ТОЛЬКО если граф еще не выбран (null)
  useEffect(() => {
    if (!isHydrated) return;
    if (user) return;
    if (localIsStudent !== false) return;
    // Важно: устанавливаем дефолт ТОЛЬКО если selectedGraphId === null
    // Если пользователь уже выбрал граф вручную, не перезаписываем его выбор
    if (selectedGraphId !== null) return;

    setSelectedGraphId(NON_STUDENT_DEFAULT_GRAPH_ID);

    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedGraphId', NON_STUDENT_DEFAULT_GRAPH_ID);
    }
  }, [isHydrated, user, localIsStudent, setSelectedGraphId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStatusReset = () => {
      setLocalIsStudent(undefined);
      setShowStudentDialog(true);
      setSelectedGraphId(null);
    };

    window.addEventListener('studentStatus:reset', handleStatusReset);

    return () => {
      window.removeEventListener('studentStatus:reset', handleStatusReset);
    };
  }, [setSelectedGraphId]);

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

  // Показываем диалог выбора статуса студента, если isStudent не определен
  // Показываем ПЕРЕД выбором университета (для авторизованных и неавторизованных)
  useEffect(() => {
    if (!isHydrated) return;
    
    // Определяем isStudent: из объекта пользователя (если авторизован) или из localStorage (если неавторизован)
    const isStudentFromUser = user ? (user as any).isStudent : undefined;
    const isStudentValue = isStudentFromUser !== undefined ? isStudentFromUser : localIsStudent;
    
    // Показываем диалог если isStudent не определен (ни в объекте пользователя, ни в localStorage)
    // Это работает как для авторизованных, так и для неавторизованных пользователей
    if (typeof isStudentValue === 'undefined') {
      setShowStudentDialog(true);
    } else {
      setShowStudentDialog(false);
    }
  }, [user, isHydrated, localIsStudent]);

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

      {/* Диалог выбора статуса студента - показывается первым */}
      <StudentStatusDialog
        isOpen={showStudentDialog}
        onClose={() => setShowStudentDialog(false)}
        onStatusSelected={(isStudent) => {
          // Сохраняем в localStorage для неавторизованных пользователей
          if (!user && typeof window !== 'undefined') {
            localStorage.setItem('isStudent', String(isStudent));
            setLocalIsStudent(isStudent);

            if (isStudent === false) {
              localStorage.setItem('selectedGraphId', NON_STUDENT_DEFAULT_GRAPH_ID);
              setSelectedGraphId(NON_STUDENT_DEFAULT_GRAPH_ID);
            } else {
              localStorage.removeItem('selectedGraphId');
              setSelectedGraphId(null);
            }
          }
        }}
      />

      {/* Если диалог открыт - не показываем ничего другого */}
      {showStudentDialog ? null : (
        <>
          {/* Определяем статус студента */}
          {(() => {
            // Определяем isStudent: из объекта пользователя (если авторизован) или из localStorage (если неавторизован)
            const isStudentFromUser = user ? (user as any).isStudent : undefined;
            const isStudent = isStudentFromUser !== undefined ? isStudentFromUser : localIsStudent;
            
            // Если пользователь не студент - показываем контент без выбора университета
            if (isStudent === false) {
              return (
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
              );
            }
            
            // Если пользователь студент (isStudent === true) или не авторизован - проверяем selectedGraphId
            // Если университет не выбран - показываем экран выбора
            // Но для неавторизованных не-студентов тоже показываем контент
            if (!selectedGraphId && isStudent !== false) {
              return (
                <div className={styles.universitySelectWrapper}>
                  <UniversitySelect />
                </div>
              );
            }
            
            // Если университет не выбран, но пользователь не студент или не авторизован не-студент
            // Показываем контент (для неавторизованных не-студентов)
            if (!selectedGraphId && isStudent === false) {
              return (
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
              );
            }
            
            // Если университет выбран - показываем контент
            return (
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
            );
          })()}
        </>
      )}
    </HeroUIProvider>
  );
}