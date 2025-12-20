'use client'

import React from 'react'
import SubsList from './SubsList'
import { useAuth } from '@/providers/AuthProvider'
import { EmptyState } from '@/components/global/EmptyState/EmptyState'
import { Heart } from 'lucide-react'

export default function SubsNewPage() {
  const { user } = useAuth()
  const graphSubsNum = user?.graphSubsNum ?? 0
  const hasSubs = graphSubsNum > 0
  
  if (!hasSubs) {
    return (
      <EmptyState
        message="Вы не подписаны ни на какие группы"
        subMessage="Подпишитесь на интересные группы, чтобы видеть их мероприятия здесь"
        icon={Heart}
      />
    )
  }
  
  return <SubsList />
}
