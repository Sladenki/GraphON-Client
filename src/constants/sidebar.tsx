import { BookmarkCheck, CircleUserRound, Globe, Menu, MessageCircle, Newspaper, Pencil, UsersRound } from 'lucide-react'

// @ts-expect-error решить поебень с типизацией
const createSidebarItem = (id, icon, title, notAuthAllow, path) => ({
  id,
  icon,
  title,
  notAuthAllow,
  path,
});

export const sidebar = [
  createSidebarItem(1, <Newspaper color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Главная', true, '/'),
  createSidebarItem(2, <MessageCircle color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Сообщения', false, '/conversations'),
  createSidebarItem(3, <BookmarkCheck color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Избранное', false, '/bookmarks'),
  createSidebarItem(4, <Pencil color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Создать пост', false, '/createPost'),
];

export const sidebarTwo = [
  createSidebarItem(1, <UsersRound color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Люди', true, '/people'),
  createSidebarItem(2, <Globe color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Проекты', true, '/projects'),
];

export const sidebarMobile = [
  createSidebarItem(1, <CircleUserRound color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Профиль', false, '/profile'),
  createSidebarItem(2, <Newspaper color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Главная', true, '/'),
  createSidebarItem(3, <MessageCircle color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Сообщения', false, '/conversations'),
  createSidebarItem(4, <Menu color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />, 'Прочее', true, '/'),
];