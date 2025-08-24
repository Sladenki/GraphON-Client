import { FC, useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { UserService } from '@/services/user.service';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import { useSetSelectedGraphId } from '@/stores/useUIStore';
import styles from './UniversitySelect.module.scss';

interface University {
  name: string;
  graphId: string;
}

const universities: University[] = [
  {
    name: 'КГТУ',
    graphId: '67a499dd08ac3c0df94d6ab7'
  },
  {
    name: 'КБК',
    graphId: '6896447465255a1c4ed48eaf'
  },
];

export const UniversitySelect = () => {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const setSelectedGraphId = useSetSelectedGraphId();
  const [selectedUniversity, setSelectedUniversity] = useState<string>('');

  useEffect(() => {
    // Инициализируем selectedUniversity из пользователя
    if (user?.selectedGraphId) {
      setSelectedUniversity(user.selectedGraphId);
    }
    // Zustand store уже автоматически инициализируется из localStorage
    // через persist middleware, поэтому нам не нужно читать localStorage вручную
  }, [user?.selectedGraphId]);

  const handleUniversityChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const graphId = e.target.value;
    setSelectedUniversity(graphId);
    
    // Обновляем состояние в Zustand store (это автоматически сохранится в localStorage)
    setSelectedGraphId(graphId);

    if (user) {
      try {
        const updatedUser = await UserService.updateSelectedGraph(graphId);
        setUser({ ...user, selectedGraphId: graphId });
      } catch (error) {
        console.error('Error updating selected graph:', error);
      }
    }

    // Обновляем страницу для отображения контента
    setTimeout(() => {
      router.refresh();
    }, 100);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Выберите университет</h2>
      <div className={styles.description}>
        <p>
          Для персонализированного доступа к учебным материалам и событиям.
        </p>
        <ul>
          <li>Доступ к учебным группам вашего университета</li>
          <li>Актуальные мероприятия и события</li>
          <li>Персонализированное расписание</li>
        </ul>
      </div>
      <div className={styles.selectWrapper}>
        <select
          className={styles.select}
          value={selectedUniversity}
          onChange={handleUniversityChange}
        >
          <option value="" disabled>Выберите университет</option>
          {universities.map(uni => (
            <option key={uni.graphId} value={uni.graphId}>
              {uni.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}; 