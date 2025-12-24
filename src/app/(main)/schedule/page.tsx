import { redirect } from 'next/navigation';

export default function SchedulePage() {
  // Страница "Расписание" перенесена в профиль.
  // Оставляем редирект, чтобы не ломать старые ссылки/закладки.
  redirect('/profile?tab=schedule');
}
