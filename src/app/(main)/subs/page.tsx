'use client'

import React from 'react'
import SubsList from './SubsList'
import { useAuth } from '@/providers/AuthProvider'

export default function SubsNewPage() {
  const { user } = useAuth()
  const hasSubs = !!(user?.graphSubsNum && user.graphSubsNum > 0)
  
  if (!hasSubs) return null
  
  return <SubsList />
}
