import React, { useState, useMemo, useEffect } from 'react';
import { Menu, X, Settings, ChevronRight } from 'lucide-react';
import { Button, Card, CardBody, CardHeader, Divider } from '@heroui/react';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { useMobileNavOptimization } from './useMobileNavOptimization';
import styles from './MobileNav.module.scss';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: Array<{
    name: string;
    label: string;
    icon?: React.ReactNode;
  }>;
}

const MobileNav: React.FC<MobileNavProps> = React.memo(({ activeTab, setActiveTab, tabs }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  // Используем оптимизированный хук
  const { handleOpenMenu, handleCloseMenu, handleBackdropClick, handleTabChange } = 
    useMobileNavOptimization({ isOpen, setIsOpen, setActiveTab });

  // Мемоизируем активную вкладку
  const activeTabLabel = useMemo(() => 
    tabs.find(tab => tab.name === activeTab)?.label || '', 
    [tabs, activeTab]
  );

  // Мемоизируем элементы навигации
  const navigationItems = useMemo(() => 
    tabs.map((tab) => {
      const isActiveTab = activeTab === tab.name;
      
      return (
        <Button
          key={tab.name}
          variant={isActiveTab ? "flat" : "light"}
          color={isActiveTab ? "primary" : "default"}
          onPress={() => handleTabChange(tab.name)}
          className={`${styles.navButton} ${isActiveTab ? styles.navButtonActive : ''}`}
          startContent={tab.icon}
        >
          {tab.label}
        </Button>
      );
    }),
    [tabs, activeTab, handleTabChange]
  );

  // Скрываем подсказку после первого открытия меню
  useEffect(() => {
    if (isOpen && showSwipeHint) {
      setShowSwipeHint(false);
      // Сохраняем в localStorage что пользователь уже видел подсказку
      localStorage.setItem('swipeHintShown', 'true');
    }
  }, [isOpen, showSwipeHint]);

  // Проверяем при загрузке, показывали ли уже подсказку
  useEffect(() => {
    const hintShown = localStorage.getItem('swipeHintShown');
    if (hintShown) {
      setShowSwipeHint(false);
    }
  }, []);

  // Определяем, показывать ли swipe индикатор
  const shouldShowSwipeIndicator = useMemo(() => {
    // Показываем только на touch устройствах и если не показали подсказку
    const isTouchDevice = 'ontouchstart' in window;
    return isTouchDevice && showSwipeHint && !isOpen;
  }, [showSwipeHint, isOpen]);

  return (
    <>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          {/* Menu Button */}
          <Button
            isIconOnly
            variant="flat"
            onPress={handleOpenMenu}
            className={styles.menuButton}
            aria-label="Открыть меню"
          >
            <Menu size={20} />
          </Button>

          {/* Logo */}
          <div className={styles.logo}>
            GraphON
          </div>

          {/* Active Tab Badge */}
          <div className={styles.activeTabBadge}>
            {activeTabLabel}
          </div>
        </div>
      </header>

      {/* Swipe Indicator */}
      {shouldShowSwipeIndicator && (
        <div className={styles.swipeIndicator} aria-hidden="true">
          <div className={styles.swipeHint}>
            <ChevronRight size={12} />
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className={styles.backdrop}
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}
        aria-hidden={!isOpen}
      >
        <Card className={styles.sidebarCard}>
          {/* Sidebar Header */}
          <CardHeader className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>
              Навигация
            </h2>
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              onPress={handleCloseMenu}
              className={styles.closeButton}
              aria-label="Закрыть меню"
            >
              <X size={16} />
            </Button>
          </CardHeader>

          <Divider className={styles.divider} />

          {/* Navigation Items */}
          <CardBody className={styles.sidebarBody}>
            <nav className={styles.nav} aria-label="Основная навигация">
              {navigationItems}
            </nav>

            <Divider className={styles.divider} />

            {/* Settings Section */}
            <div className={styles.settingsSection}>
              <div className={styles.settingsHeader}>
                <div className={styles.settingsText}>
                  <div className={styles.settingsTitle}>Настройки</div>
                  <div className={styles.settingsSubtitle}>Смена темы</div>
                </div>
              </div>
              <div className={styles.themeToggleWrapper}>
                <ThemeToggle size="sm" />
              </div>
            </div>

            {/* Swipe Hint для первого использования */}
            {showSwipeHint && (
              <div className={styles.swipeHintCard}>
                <div className={styles.swipeHintIcon}>
                  <ChevronRight size={16} />
                </div>
                <div className={styles.swipeHintText}>
                  <div className={styles.swipeHintTitle}>Подсказка</div>
                  <div className={styles.swipeHintDescription}>
                    Свайпните от левого края экрана для быстрого открытия меню
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </aside>
    </>
  );
});

MobileNav.displayName = 'MobileNav';

export default MobileNav; 