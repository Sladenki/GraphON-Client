'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import MaintenancePage from '../MaintenancePage/MaintenancePage';

interface MaintenanceWrapperProps {
  children: React.ReactNode;
}

const MaintenanceWrapper: React.FC<MaintenanceWrapperProps> = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Проверяем переменную окружения
  const isTechWorksEnabled = process.env.NEXT_PUBLIC_TECH_WORKS === 'true';
  
  // Если техработы не включены, показываем обычный контент
  if (!isTechWorksEnabled) {
    return <>{children}</>;
  }
  
  // Ждем загрузки данных пользователя
  if (loading) {
    return <>{children}</>;
  }
  
  // Проверяем username пользователя
  const username = user?.username || '';
  const isAdmin = username === 'SlishkomSladki';
  
  // Если это администратор - показываем обычный контент
  if (isAdmin) {
    return <>{children}</>;
  }
  
  // Для всех остальных показываем страницу техобслуживания
  return <MaintenancePage />;
};

export default MaintenanceWrapper;

