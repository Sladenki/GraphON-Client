import { CircleUserRound, House, Pencil, CalendarCheck, Settings, Users, Heart, Network, Newspaper } from 'lucide-react'
import { JSX } from 'react';

interface SidebarItem {
  id: number;
  icon: JSX.Element;
  title: string;
  forAuthUsers: boolean;
  path: string;
}

const createSidebarItem = (
  id: number,
  icon: JSX.Element,
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
  createSidebarItem(1, <House color="rgb(var(--main-Color))" size={21} strokeWidth={1} />, 'Главная', false, '/'),
  createSidebarItem(4, <Users color="rgb(var(--main-Color))" size={21} strokeWidth={1} />, 'Группы', false, '/groups/'),
  createSidebarItem(5, <Newspaper color="rgb(var(--main-Color))" size={21} strokeWidth={1} />, 'Мероприятия', false, '/events/'),
  createSidebarItem(6, <Heart color="rgb(var(--main-Color))" size={21} strokeWidth={1} />, 'Подписки', true, '/subs/'),
  createSidebarItem(7, <Network color="rgb(var(--main-Color))" size={21} strokeWidth={1} />, 'Графы', false, '/graphs/'),
  createSidebarItem(2, <CalendarCheck color="rgb(var(--main-Color))" size={21} strokeWidth={1} />, 'Расписание', true, '/schedule/'),
  createSidebarItem(3, <Pencil color="rgb(var(--main-Color))" size={21} strokeWidth={1} />, 'Админка', true, '/admin/'),
];

// --- Для BottomMenu (нижняя панель) ---
export const bottomMenuItems = [
  createSidebarItem(1, <Newspaper color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />, 'Мероприятия', false, '/events/'),
  createSidebarItem(2, <CalendarCheck color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />, 'Расписание', true, '/schedule/'),
  createSidebarItem(3, <Pencil color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />, 'Админка', true, '/admin/'),
];

// --- Для MobileDrawer (боковое меню) ---
export const mobileDrawerItems = [
  createSidebarItem(1, <House color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />, 'Главная', false, '/'),
  createSidebarItem(2, <Users color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />, 'Группы', false, '/groups/'),
  createSidebarItem(3, <Heart color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />, 'Подписки', true, '/subs/'),
  createSidebarItem(4, <Network color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />, 'Графы', false, '/graphs/'),
];