import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { UserService } from '@/services/user.service';
import { useSetSelectedGraphId } from '@/stores/useUIStore';
import { BookOpen, Calendar, Clock, Check } from 'lucide-react';
import styles from './UniversitySelect.module.scss';

interface University {
  name: string;
  graphId: string;
  description: string;
}

const universities: University[] = [
  {
    name: 'КГТУ',
    graphId: '67a499dd08ac3c0df94d6ab7',
    description: 'Калининградский государственный технический университет'
  },
  {
    name: 'КБК',
    graphId: '6896447465255a1c4ed48eaf',
    description: 'Калининградский бизнес колледж'
  },
];

export const UniversitySelect: React.FC = () => {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const setSelectedGraphId = useSetSelectedGraphId();
  const [selectedUniversity, setSelectedUniversity] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUniversityClick = (graphId: string) => {
    setSelectedUniversity(graphId);
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

      // Переходим на страницу событий
      setTimeout(() => {
        router.push('/events/');
      }, 100);
    } catch (error) {
      console.error('Error updating selected graph:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Добро пожаловать в GraphON!</h1>
      
      <p className={styles.subtitle}>
        Выберите ваш университет, чтобы начать работу
      </p>

      <div className={styles.benefits}>
        <div className={styles.benefit}>
          <div className={styles.benefitIcon}>
            <BookOpen size={20} />
          </div>
          <span>Учебные группы</span>
        </div>
        <div className={styles.benefit}>
          <div className={styles.benefitIcon}>
            <Calendar size={20} />
          </div>
          <span>Мероприятия</span>
        </div>
        <div className={styles.benefit}>
          <div className={styles.benefitIcon}>
            <Clock size={20} />
          </div>
          <span>Расписание</span>
        </div>
      </div>

      <div className={styles.universities}>
        {universities.map(uni => (
          <button
            key={uni.graphId}
            className={`${styles.universityCard} ${
              selectedUniversity === uni.graphId ? styles.selected : ''
            }`}
            onClick={() => handleUniversityClick(uni.graphId)}
            type="button"
          >
            <div className={styles.radioIndicator}>
              <div className={styles.radioInner} />
            </div>
            
            <div className={styles.cardContent}>
              <h3 className={styles.universityName}>{uni.name}</h3>
              <p className={styles.universityDescription}>{uni.description}</p>
            </div>

            {selectedUniversity === uni.graphId && (
              <div className={styles.checkIcon}>
                <Check size={18} />
              </div>
            )}
          </button>
        ))}
      </div>

      <button 
        className={styles.submitButton}
        onClick={handleSubmit}
        disabled={!selectedUniversity || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className={styles.spinner} />
            <span>Загрузка...</span>
          </>
        ) : (
          'Продолжить'
        )}
      </button>
    </div>
  );
};
