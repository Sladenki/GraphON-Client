import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { UserService } from '@/services/user.service';
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

export const UniversitySelect: React.FC = () => {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const setSelectedGraphId = useSetSelectedGraphId();
  const [selectedUniversity, setSelectedUniversity] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUniversityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUniversity(e.target.value);
  };

  const handleSubmit = async () => {
    if (!selectedUniversity || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Обновляем состояние в Zustand store (сохранится в localStorage)
      setSelectedGraphId(selectedUniversity);

      // Если пользователь авторизован, обновляем на сервере
      if (user) {
        await UserService.updateSelectedGraph(selectedUniversity);
        setUser({ ...user, selectedGraphId: selectedUniversity });
      }

      // Обновляем страницу для отображения контента
      setTimeout(() => {
        router.refresh();
      }, 100);
    } catch (error) {
      console.error('Error updating selected graph:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Добро пожаловать в GraphON!</h2>
      
      <div className={styles.description}>
        <p className={styles.lead}>
          Выберите ваш университет, чтобы начать
        </p>
        <ul className={styles.benefits}>
          <li>📚 Доступ к учебным группам вашего университета</li>
          <li>📅 Актуальные мероприятия и события</li>
          <li>⏰ Персонализированное расписание</li>
        </ul>
      </div>

      <div className={styles.selectWrapper}>
        <label htmlFor="university-select" className={styles.label}>
          Университет
        </label>
        <select
          id="university-select"
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

      <button 
        className={styles.submitButton}
        onClick={handleSubmit}
        disabled={!selectedUniversity || isSubmitting}
      >
        {isSubmitting ? 'Загрузка...' : 'Продолжить'}
      </button>
    </div>
  );
}; 