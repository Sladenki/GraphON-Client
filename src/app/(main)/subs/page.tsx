import { redirect } from 'next/navigation'

export default function SubsPage() {
  // Страница "Подписки" перенесена на /events (переключатель "Все / Подписки").
  // Оставляем редирект, чтобы не ломать старые ссылки/закладки.
  redirect('/events/?tab=subs')
}
