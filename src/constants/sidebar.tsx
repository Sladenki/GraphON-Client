import { CircleUserRound, Handshake, House, Menu, MessageCircle, Newspaper, Pencil, Settings, Sheet } from 'lucide-react'

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
  createSidebarItem(2, <Sheet color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Расписание', true, '/conversations'),
  createSidebarItem(3, <Handshake color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Подписки', true, '/bookmarks'),
  createSidebarItem(4, <Pencil color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Создать пост', true, '/createPost'),
];

export const sidebarTwo = [
  createSidebarItem(1, <Settings color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Настройки', true, '/people'),
];

export const sidebarMobile = [
  createSidebarItem(1, <CircleUserRound color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Профиль', false, '/profile'),
  createSidebarItem(2, <Newspaper color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Главная', true, '/'),
  createSidebarItem(3, <MessageCircle color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Сообщения', false, '/conversations'),
  createSidebarItem(4, <Menu color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Прочее', true, '/'),
];