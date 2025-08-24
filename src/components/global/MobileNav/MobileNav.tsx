import React, { useState, useMemo } from 'react';
import { Menu, X, Settings } from 'lucide-react';
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

/**
 * MobileNav - мобильная навигация с поддержкой свайпов
 * 
 * Поддерживаемые жесты:
 * - Свайп слева направо (в любом месте экрана) - открывает боковую панель
 * - Свайп справа налево (когда панель открыта) - закрывает боковую панель
 * - Минимальное расстояние свайпа: 50px
 * - Максимальное время свайпа: 300ms
 * - Максимальное вертикальное отклонение: 100px
 */

const MobileNav: React.FC<MobileNavProps> = React.memo(({ activeTab, setActiveTab, tabs }) => {
  const [isOpen, setIsOpen] = useState(false);

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
            <Menu size={18} />
          </Button>

          {/* Logo */}
          <div className={styles.logo}>
            GraphON
            <div className={styles.betaLabel}>
              Альфа версия
            </div>
          </div>
          

          {/* Active Tab Badge */}
          <div className={styles.activeTabBadge}>
            {activeTabLabel}
          </div>
        </div>
      </header>

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
                  <div className={styles.settingsSubtitle}>Смена темы</div>
                </div>
              </div>
              <div className={styles.themeToggleWrapper}>
                <ThemeToggle size="sm" />
              </div>
            </div>
          </CardBody>
        </Card>
      </aside>
    </>
  );
});

MobileNav.displayName = 'MobileNav';

export default MobileNav; 