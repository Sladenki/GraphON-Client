import { notFound } from 'next/navigation'

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Проверяем на сервере - страница доступна только в dev режиме
  const isDev = process.env.NEXT_CLIENT_STATUS === 'dev'
  
  if (!isDev) {
    // В продакшене показываем 404
    notFound()
  }
  
  return <>{children}</>
}
