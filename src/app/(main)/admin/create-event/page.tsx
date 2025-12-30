'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { CreateEventForm } from '@/components/admin/CreateEventForm/CreateEventForm';
import { useAuth } from '@/providers/AuthProvider';
import styles from './createEvent.module.scss';

export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSuccess = () => {
    // Возвращаемся на /admin после успешного создания
    setTimeout(() => {
      router.push('/admin');
    }, 1000);
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerBar}>
        <button 
          className={styles.backButton}
          onClick={() => router.push('/admin')}
          aria-label="Вернуться назад"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className={styles.headerTitle}>Создание события</h2>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Создать мероприятие</h1>
          <p className={styles.subtitle}>
            Создайте новое мероприятие для вашей группы
          </p>
        </div>

        <div className={styles.formContainer}>
          <CreateEventForm 
            globalGraphId={user?.selectedGraphId || ''} 
            hideGraphDropdown={true}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
}

