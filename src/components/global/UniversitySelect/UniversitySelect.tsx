import { FC, useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { UserService } from '@/services/user.service';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import styles from './UniversitySelect.module.scss';

interface UniversitySelectProps {
  className?: string;
}

interface University {
  name: string;
  graphId: string;
}

const universities: University[] = [
  {
    name: 'КГТУ',
    graphId: '67a499dd08ac3c0df94d6ab7'
  }
];

export const UniversitySelect: FC<UniversitySelectProps> = ({ className }) => {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [selectedUniversity, setSelectedUniversity] = useState<string>('');

  useEffect(() => {
    // Check localStorage on component mount
    const savedGraphId = localStorage.getItem('selectedGraphId');
    if (savedGraphId) {
      setSelectedUniversity(savedGraphId);
      // Если пользователь не авторизован, но есть сохраненный graphId,
      // обновляем состояние как будто он выбран
      if (!user) {
        router.refresh();
      }
    }
  }, []);

  const handleUniversityChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const graphId = e.target.value;
    setSelectedUniversity(graphId);

    if (user) {
      try {
        const updatedUser = await UserService.updateSelectedGraph(graphId);
        // Обновляем состояние пользователя с новым selectedGraphId
        setUser({ ...user, selectedGraphId: graphId });
      } catch (error) {
        console.error('Error updating selected graph:', error);
      }
    } else {
      // User is not authenticated, save to localStorage
      localStorage.setItem('selectedGraphId', graphId);
      // Принудительно обновляем страницу, чтобы отобразить контент
      router.refresh();
    }
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
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
      {user && (
        <div className={styles.note}>
          <Settings size={16} />
          <span>
            Вы можете изменить университет в{' '}
            <Link href="/profile">настройках профиля</Link>
          </span>
        </div>
      )}
    </div>
  );
}; 