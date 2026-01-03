import { Pencil, Users, Network, Newspaper, User, UserPlus, Bell } from 'lucide-react'
import { JSX } from 'react';

export const GRAPHS_ROUTE = '/graphs/';
export const CITY_ROUTE = '/city';
export const CITY_GRAPH_ID = '690bfec3f371d05b325be7ad';

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
  // createSidebarItem(1, <House color="rgb(var(--main-Color))" size={21} strokeWidth={1} />, 'Главная', false, '/'),
  createSidebarItem(5, <Newspaper color="rgb(var(--main-Color))" size={21} strokeWidth={1} />, 'События', false, '/events/'),
  createSidebarItem(4, <Users color="rgb(var(--main-Color))" size={21} strokeWidth={1} />, 'Группы', false, '/groups/'),
  createSidebarItem(7, <Network color="rgb(var(--main-Color))" size={21} strokeWidth={1} />, 'Графы', false, GRAPHS_ROUTE),
  createSidebarItem(3, <Pencil color="rgb(var(--main-Color))" size={21} strokeWidth={1} />, 'Админка', true, '/admin/'),
];

// Пункты, которые должны идти "под Профиль" в боковом меню
export const profileSubMenu = [
  createSidebarItem(6, <UserPlus color="rgb(var(--main-Color))" size={21} strokeWidth={1} />, 'Друзья', true, '/friends'),
  // createSidebarItem(8, <Bell color="rgb(var(--main-Color))" size={21} strokeWidth={1} />, 'Уведомления', true, '/notifications'),
];

// --- Для BottomMenu (нижняя панель) ---
export const bottomMenuItems = [
  createSidebarItem(1, <Newspaper color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />, 'Мероприятия', false, '/events/'),
  createSidebarItem(2, <User color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />, 'Профиль', true, '/profile'),
  createSidebarItem(3, <Pencil color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />, 'Админка', true, '/admin/'),
];