'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
	const [client] = useState(
		new QueryClient({
			defaultOptions: {
				queries: {
					// Отключение автоматического обновления запросов при фокусировке окна
					refetchOnWindowFocus: false
				}
			}
		})
	)

	return (
		<QueryClientProvider client={client}>
			{children}
		</QueryClientProvider>
	)
}
