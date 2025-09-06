import { CircleUserRound, House, Pencil, CalendarCheck, Settings } from 'lucide-react'
import { ReactNode } from 'react';

interface SidebarItem {
  id: number;
  icon: ReactNode;
  title: string;
  forAuthUsers: boolean;
  path: string;
}

const createSidebarItem = (
  id: number,
  icon: ReactNode,
  title: string,
  forAuthUsers: boolean,
  path: string
): SidebarItem => ({
  id,
  icon,
  title,
  forAuthUsers,
  path,
});

// ----- Для десктопа ----
export const sidebar = [
  createSidebarItem(1, <House color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Главная', false, '/'),
  createSidebarItem(2, <CalendarCheck color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Расписание', true, '/schedule/'),
  createSidebarItem(3, <Pencil color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Создать', true, '/createPost/'),
];

// --- Для мобилок ---
export const sidebarMobile = [
  createSidebarItem(1, <House color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />, 'Новости', false, '/'),
  createSidebarItem(2, <CalendarCheck color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />, 'Расписание', true, '/schedule/'),
  // Управление будет добавляться динамически в BottomMenu
  createSidebarItem(3, <Pencil color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />, 'Создать', true, '/createPost/'),
  createSidebarItem(4, <CircleUserRound color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />, 'Профиль', false, '/profile/'),
];