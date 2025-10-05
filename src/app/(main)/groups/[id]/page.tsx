'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { GraphService } from '@/services/graph.service'
import { EventService } from '@/services/event.service'
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader'
import { EmptyState } from '@/components/global/EmptyState/EmptyState'
import EventCard from '@/components/ui/EventCard/EventCard'
import { Button } from '@heroui/react'
import { ArrowLeft, Calendar, Heart, HeartCrack, Users, MapPin } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/providers/AuthProvider'
import { useSubscription } from '@/hooks/useSubscriptionGraph'
import { notifyInfo, notifySuccess } from '@/lib/notifications'
import styles from './GraphPage.module.scss'

const BASE_S3_URL = process.env.NEXT_PUBLIC_S3_URL

export default function GraphPage() {
  const params = useParams()
  const router = useRouter()
  const graphId = params.id as string
  const { isLoggedIn } = useAuth()

  // Загрузка данных графа
  const { data: graph, isLoading, error } = useQuery({
    queryKey: ['graph', graphId],
    queryFn: async () => {
      const response = await GraphService.getGraphById(graphId)
      return response
    },
    enabled: !!graphId,
  })

  // Загрузка мероприятий группы
  const { data: events, isLoading: isLoadingEvents, error: eventsError } = useQuery({
    queryKey: ['events', graphId],
    queryFn: async () => {
      const response = await EventService.getEventsByGraphId(graphId)
      return response
    },
    enabled: !!graphId,
  })
  const { isSubscribed, toggleSubscription, isLoading: isSubscribing } = useSubscription(
    graph?.isSubscribed ?? false,
    graphId
  )

  const handleSubscription = () => {
    toggleSubscription()
    if (!isSubscribed) {
      notifySuccess(
        'Вы подписались на граф',
        'Расписание этого графа будет отображаться в вашем расписании'
      )
    } else {
      notifyInfo('Вы отписались от графа')
    }
  }

  const fullImageUrl = graph?.imgPath ? `${BASE_S3_URL}/${graph.imgPath}` : ''

  if (isLoading) {
    return (
      <div className={styles.loader}>
        <SpinnerLoader />
      </div>
    )
  }

  if (error || !graph) {
    return (
      <div className={styles.error}>
        <EmptyState
          message="Граф не найден"
          subMessage="Попробуйте вернуться назад и выбрать другой граф"
          emoji="🔍"
        />
        <Button
          color="primary"
          variant="flat"
          startContent={<ArrowLeft size={18} />}
          onPress={() => router.back()}
          className={styles.backButton}
        >
          Назад
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Кнопка назад */}
      <Button
        color="default"
        variant="light"
        startContent={<ArrowLeft size={18} />}
        onPress={() => router.back()}
        className={styles.backButton}
      >
        Назад к группам
      </Button>

      {/* Карточка графа */}
      <div className={styles.graphCard}>
        {/* Заголовок с изображением */}
        <div className={styles.cardHeader}>
          <div className={styles.imageSection}>
            {fullImageUrl ? (
              <Image
                src={fullImageUrl}
                alt={graph.name}
                width={600}
                height={300}
                className={styles.graphImage}
                priority
              />
            ) : (
              <div className={styles.placeholderImage}>
                <div className={styles.placeholderIcon}>📷</div>
              </div>
            )}
          </div>

          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>{graph.name}</h1>
              
              {graph.parentGraphId && (
                <div className={styles.parentChip}>
                  <div className={styles.parentIcon}>
                    <Users size={16} />
                  </div>
                  <div className={styles.parentContent}>
                    <span className={styles.parentName}>{graph.parentGraphId.name}</span>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.actionButtons}>
              <Button
                size="sm"
                variant="flat"
                color="primary"
                startContent={<Calendar size={18} />}
                onPress={() => {
                  router.push(`/schedule/?graphId=${graphId}`)
                }}
                className={styles.scheduleButton}
              >
                Расписание
              </Button>
              
              {isLoggedIn && (
                <Button
                  color={isSubscribed ? 'danger' : 'primary'}
                  variant={isSubscribed ? 'flat' : 'solid'}
                  startContent={
                    isSubscribed ? <HeartCrack size={18} /> : <Heart size={18} />
                  }
                  onPress={handleSubscription}
                  isLoading={isSubscribing}
                  className={styles.subscribeButton}
                >
                  {isSubscribed ? 'Отписаться' : 'Подписаться'}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Тело карточки */}
        <div className={styles.cardBody}>
          {/* Описание */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>О группе</h2>
            <p className={styles.description}>
              {graph.about || 'Описание отсутствует'}
            </p>
          </div>

        </div>
      </div>

      {/* Секция мероприятий */}
      {events?.data && events.data.length > 0 && (
        <div className={styles.eventsSection}>
          <h2 className={styles.eventsTitle}>Мероприятия группы</h2>
          
          {isLoadingEvents ? (
            <div className={styles.loader}>
              <SpinnerLoader />
            </div>
          ) : events.data.length > 0 ? (
            <div className={styles.eventsList}>
              {events.data.map((event: any, index: number) => (
                <div 
                  key={event._id} 
                  className={styles.eventCard}
                  style={{ 
                    '--delay': `${Math.min(index * 0.05, 0.5)}s`
                  } as React.CSSProperties}
                >
                  <EventCard 
                    event={event} 
                    isAttended={false}
                    onDelete={() => {}}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyStateWrapper}>
              <EmptyState
                message="У группы пока нет мероприятий"
                subMessage="Мероприятия появятся здесь, когда будут созданы"
                emoji="📅"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
