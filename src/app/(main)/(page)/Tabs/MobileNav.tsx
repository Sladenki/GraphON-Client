import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import clsx from 'clsx';

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
    <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Бургер-меню */}
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Открыть меню"
        >
          <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Логотип */}
        <div className="text-xl font-semibold text-gray-900 dark:text-white">
          GraphON
        </div>

        {/* Активная вкладка */}
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {activeTabLabel}
        </div>
      </div>

      {/* Выдвижное меню */}
      {isOpen && (
        <>
          {/* Затемнение фона */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Панель меню */}
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
                <div 
                  className="pointer-events-auto w-screen max-w-xs transform transition-transform duration-300 ease-in-out"
                  style={{
                    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'
                  }}
                >
                  <div className="flex h-full flex-col bg-white dark:bg-gray-900 shadow-xl">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        Меню
                      </div>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Закрыть меню"
                      >
                        <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4">
                      <nav className="space-y-1 px-2">
                        {tabs.map((tab) => (
                          <button
                            key={tab.name}
                            onClick={() => {
                              setActiveTab(tab.name);
                              setIsOpen(false);
                            }}
                            className={clsx(
                              'w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                              activeTab === tab.name
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                            )}
                          >
                            {tab.icon && (
                              <span className="mr-3">{tab.icon}</span>
                            )}
                            {tab.label}
                          </button>
                        ))}
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileNav; 