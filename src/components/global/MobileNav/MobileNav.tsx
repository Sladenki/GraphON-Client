import React, { useState, useEffect } from 'react';
import { Menu, X, Settings } from 'lucide-react';
import { Button, Card, CardBody, CardHeader, Divider } from '@heroui/react';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
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

const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab, tabs }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Блокируем скролл при открытом меню
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const activeTabLabel = tabs.find(tab => tab.name === activeTab)?.label || '';

  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          {/* Menu Button */}
          <Button
            isIconOnly
            variant="flat"
            onPress={() => setIsOpen(true)}
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
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className={styles.backdrop}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <Card className={styles.sidebarCard}>
          {/* Sidebar Header */}
          <CardHeader className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>
              Навигация
            </div>
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              onPress={() => setIsOpen(false)}
              className={styles.closeButton}
              aria-label="Закрыть меню"
            >
              <X size={16} />
            </Button>
          </CardHeader>

          <Divider className={styles.divider} />

          {/* Navigation Items */}
          <CardBody className={styles.sidebarBody}>
            <nav className={styles.nav}>
              {tabs.map((tab, index) => (
                <Button
                  key={tab.name}
                  variant={activeTab === tab.name ? "flat" : "light"}
                  color={activeTab === tab.name ? "primary" : "default"}
                  onPress={() => {
                    setActiveTab(tab.name);
                    setIsOpen(false);
                  }}
                  className={`${styles.navButton} ${activeTab === tab.name ? styles.navButtonActive : ''}`}
                  startContent={tab.icon}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {tab.label}
                </Button>
              ))}
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
          </CardBody>
        </Card>
      </div>
    </>
  );
};

export default MobileNav; 