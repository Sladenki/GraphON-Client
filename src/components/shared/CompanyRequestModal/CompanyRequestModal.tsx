'use client';

import React, { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { CompanyRequestService, CompanyRequest } from '@/services/companyRequest.service';
import { useAuth } from '@/providers/AuthProvider';
import { notifyError, notifySuccess } from '@/lib/notifications';
import { getPastelTheme, type ThemeName } from '@/components/shared/EventCard/pastelTheme';
import styles from './CompanyRequestModal.module.scss';

interface CompanyRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

export default function CompanyRequestModal({ isOpen, onClose, eventId }: CompanyRequestModalProps) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasActiveRequest, setHasActiveRequest] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRequests();
    }
  }, [isOpen, user?._id]);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await CompanyRequestService.getRequestsByEvent(eventId);
      setRequests(data);
      // Проверяем, есть ли активный запрос от текущего пользователя
      const myRequest = data.find(r => r.initiator._id === user?._id);
      setHasActiveRequest(!!myRequest);
    } catch (error) {
      console.error('Error loading requests:', error);
      notifyError('Не удалось загрузить список');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      await CompanyRequestService.cancelRequest();
      setHasActiveRequest(false);
      notifySuccess('Запрос отменен');
      loadRequests();
    } catch (error) {
      console.error('Error canceling request:', error);
      notifyError('Не удалось отменить запрос');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'минуту' : diffMins < 5 ? 'минуты' : 'минут'} назад`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'час' : diffHours < 5 ? 'часа' : 'часов'} назад`;
    } else {
      return `${diffDays} ${diffDays === 1 ? 'день' : diffDays < 5 ? 'дня' : 'дней'} назад`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Кто ищет компанию</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
            <X size={20} />
          </button>
        </div>

        {hasActiveRequest && (
          <div className={styles.activeRequestBanner}>
            <span>Вы ищете компанию</span>
            <button className={styles.cancelButton} onClick={handleCancelRequest}>
              Отменить
            </button>
          </div>
        )}

        <div className={styles.content}>
          {isLoading ? (
            <div className={styles.loading}>Загрузка...</div>
          ) : requests.length === 0 ? (
            <div className={styles.empty}>
              <Users size={48} />
              <p>Пока никто не ищет компанию</p>
            </div>
          ) : (
            <div className={styles.list}>
              {requests.map((request) => (
                <div key={request.requestId} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.userInfo}>
                      {request.initiator.avaPath ? (
                        <img
                          src={request.initiator.avaPath.startsWith('http') 
                            ? request.initiator.avaPath 
                            : `${process.env.NEXT_PUBLIC_S3_URL}/${request.initiator.avaPath}`}
                          alt={`${request.initiator.firstName} ${request.initiator.lastName}`}
                          className={styles.avatar}
                        />
                      ) : (
                        <div className={styles.avatarFallback}>
                          {(request.initiator.firstName?.[0] || request.initiator.lastName?.[0] || 'U').toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className={styles.userName}>
                          {request.initiator.firstName} {request.initiator.lastName}
                        </div>
                        {request.initiator.username && (
                          <div className={styles.username}>@{request.initiator.username}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {request.initiator.topInterests && request.initiator.topInterests.length > 0 && (
                    <div className={styles.interests}>
                      {request.initiator.topInterests.map((interest) => {
                        const themeName = interest.name as ThemeName;
                        const theme = getPastelTheme(themeName);
                        return (
                          <span key={interest._id} className={`${styles.interestPill} ${theme.chip}`}>
                            {interest.displayName || interest.name}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div className={styles.matchInfo}>
                    <div className={styles.matchScore}>
                      Совместимость: <strong>{Math.round(request.matchScore * 100)}%</strong>
                    </div>
                    {request.commonInterests.length > 0 && (
                      <div className={styles.commonInterests}>
                        Общие интересы: {request.commonInterests.map(ci => ci.interestName).join(', ')}
                      </div>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.timeAgo}>
                      Ищет компанию • {formatTimeAgo(request.createdAt)}
                    </div>
                    <div className={styles.actions}>
                      <button className={styles.actionButton}>Написать</button>
                      <button className={styles.actionButtonPrimary}>Предложить встречу</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

