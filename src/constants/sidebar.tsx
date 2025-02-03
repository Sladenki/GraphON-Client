import { CircleUserRound, Handshake, House, Pencil, Settings, CalendarCheck } from 'lucide-react'

// @ts-expect-error решить поебень с типизацией
const createSidebarItem = (id, icon, title, forAuthUsers, path) => ({
  id,
  icon,
  title,
  forAuthUsers,
  path,
});

export const sidebar = [
  createSidebarItem(1, <House color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Главная', false, '/'),
  createSidebarItem(2, <CalendarCheck color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Расписание', true, '/schedule'),
  createSidebarItem(3, <Handshake color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Подписки', true, '/subs'),
  createSidebarItem(4, <Pencil color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Создать пост', true, '/createPost'),
];

export const sidebarTwo = [
  createSidebarItem(1, <Settings color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Настройки', false, '/settings'),
];

// --- Для мобилок ---
export const sidebarMobile = [
  createSidebarItem(1, <House color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />, 'Главная', false, '/'),
  createSidebarItem(2, <CalendarCheck color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />, 'Расписание', true, '/schedule'),
  createSidebarItem(3, <Handshake color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />, 'Подписки', true, '/subs'),
  createSidebarItem(4, <CircleUserRound color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />, 'Профиль', false, '/profile'),
  createSidebarItem(5, <Settings color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />, 'Настройки', false, '/settings'),
];