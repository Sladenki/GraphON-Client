'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { GraphService } from '@/services/graph.service'
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader'
import { EmptyState } from '@/components/global/EmptyState/EmptyState'
import { Button, Card, CardHeader, CardBody, Chip, Divider } from '@heroui/react'
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
      <Card className={styles.graphCard}>
        {/* Заголовок с изображением */}
        <CardHeader className={styles.cardHeader}>
          <div className={styles.imageSection}>
            {fullImageUrl ? (
              <Image
                src={fullImageUrl}
                alt={graph.name}
                width={600}
                height={400}
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
                <Chip
                  variant="flat"
                  size="sm"
                  startContent={<Users size={14} />}
                  className={styles.parentChip}
                >
                  {graph.parentGraphId.name}
                </Chip>
              )}
            </div>

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
        </CardHeader>

        <Divider />

        {/* Тело карточки */}
        <CardBody className={styles.cardBody}>
          {/* Описание */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>О группе</h2>
            <p className={styles.description}>
              {graph.about || 'Описание отсутствует'}
            </p>
          </div>

          <Divider className={styles.divider} />

          {/* Информация */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Информация</h2>
            
            <div className={styles.infoGrid}>
              {graph.ownerUserId && typeof graph.ownerUserId === 'object' && (
                <div className={styles.infoItem}>
                  <Users size={18} className={styles.infoIcon} />
                  <span className={styles.infoLabel}>Владелец:</span>
                  <span className={styles.infoValue}>
                    {graph.ownerUserId.username || 'Не указан'}
                  </span>
                </div>
              )}

              {graph.parentGraphId && (
                <div className={styles.infoItem}>
                  <MapPin size={18} className={styles.infoIcon} />
                  <span className={styles.infoLabel}>Родительская группа:</span>
                  <span className={styles.infoValue}>
                    {graph.parentGraphId.name}
                  </span>
                </div>
              )}

              <div className={styles.infoItem}>
                <Calendar size={18} className={styles.infoIcon} />
                <span className={styles.infoLabel}>Расписание:</span>
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  onPress={() => {
                    // Открываем расписание
                    router.push(`/schedule/?graphId=${graphId}`)
                  }}
                >
                  Посмотреть расписание
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
