import { FC, useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { UserService } from '@/services/user.service';
import { Settings } from 'lucide-react';
import Link from 'next/link';
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
  // {
  //   name: 'БГА',
  //   graphId: '683edc75c21bf7c5b2b85b21'
  // },
];

export const UniversitySelect = () => {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [selectedUniversity, setSelectedUniversity] = useState<string>('');

  useEffect(() => {
    // Проверяем наличие сохраненного graphId при монтировании
    const savedGraphId = localStorage.getItem('selectedGraphId');
    if (savedGraphId) {
      setSelectedUniversity(savedGraphId);
      // Если пользователь не авторизован, но есть сохраненный graphId
      if (!user) {
        // Добавляем небольшую задержку для обновления состояния
        setTimeout(() => {
          router.refresh();
        }, 100);
      }
    }
  }, []);

  const handleUniversityChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const graphId = e.target.value;
    setSelectedUniversity(graphId);

    if (user) {
      try {
        const updatedUser = await UserService.updateSelectedGraph(graphId);
        setUser({ ...user, selectedGraphId: graphId });
      } catch (error) {
        console.error('Error updating selected graph:', error);
      }
    } else {
      // Для неавторизованного пользователя
      localStorage.setItem('selectedGraphId', graphId);
      // Добавляем событие для оповещения других компонентов
      const event = new CustomEvent('graphSelected', { detail: graphId });
      window.dispatchEvent(event);
      // Обновляем страницу для отображения контента
      setTimeout(() => {
        router.refresh();
      }, 100);
    }
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