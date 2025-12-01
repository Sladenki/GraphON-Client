import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { UserService } from '@/services/user.service';
import { useSetSelectedGraphId } from '@/stores/useUIStore';
import { BookOpen, Calendar, Clock, Check, GraduationCap, ChevronDown } from 'lucide-react';
import styles from './UniversitySelect.module.scss';
import { RequestConnectedGraphService } from '@/services/requestConnectedGraph.service';
import { notifyError, notifySuccess } from '@/lib/notifications';
import { NON_STUDENT_DEFAULT_GRAPH_ID } from '@/constants/nonStudentDefaults';
import { kaliningradInstitutions, InstitutionOption } from './kaliningradInstitutions';

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
  const [showRequestSection, setShowRequestSection] = useState(false);
  const [requestSelection, setRequestSelection] = useState<string>('');
  const [isRequestSubmitting, setIsRequestSubmitting] = useState(false);

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

  const handleRequestToggle = () => {
    setShowRequestSection((prev) => {
      if (prev) {
        setRequestSelection('');
      }
      return !prev;
    });
  };

  const handleRequestSubmit = async () => {
    if (!requestSelection || isRequestSubmitting) return;

    setIsRequestSubmitting(true);

    try {
      await RequestConnectedGraphService.createRequest(user?._id ?? null, requestSelection);
      notifySuccess('Запрос отправлен', 'Мы сообщим, как только добавим ваш вуз');
      setRequestSelection('');
      setShowRequestSection(false);

      // Перенаправляем пользователя в общий (калининградский) граф
      setSelectedGraphId(NON_STUDENT_DEFAULT_GRAPH_ID);

      if (user) {
        try {
          await UserService.updateSelectedGraph(NON_STUDENT_DEFAULT_GRAPH_ID);
          setUser({ ...user, selectedGraphId: NON_STUDENT_DEFAULT_GRAPH_ID });
        } catch (updateError) {
          console.error('Error syncing fallback graph:', updateError);
        }
      }

      setTimeout(() => {
        router.push('/events');
      }, 100);
    } catch (error) {
      console.error('Error sending request:', error);
      notifyError('Не удалось отправить запрос', 'Попробуйте еще раз позже');
    } finally {
      setIsRequestSubmitting(false);
    }
  };

  const formatInstitutionValue = (option: InstitutionOption) => {
    if (option.description) {
      return `${option.title} — ${option.description}`;
    }
    return option.title;
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

      <div className={styles.outOfListBox}>
        <div className={styles.outOfListInfo}>
          <GraduationCap size={18} />
          <span>Не нашли свой вуз в списке?</span>
        </div>
        <button 
          type="button" 
          className={styles.outOfListButton}
          onClick={handleRequestToggle}
        >
          {showRequestSection ? 'Свернуть список' : 'Моего вуза тут нет'}
        </button>
      </div>

      {showRequestSection && (
        <div className={styles.requestSection}>
          <p className={styles.requestHint}>
            Выберите ваш университет или колледж Калининграда. Мы уведомим вас, когда подключим его к GraphON.
          </p>

          <div className={styles.dropdownWrapper}>
            <label htmlFor="request-university" className={styles.dropdownLabel}>
              Выберите учебное заведение
            </label>
            <div className={styles.selectWrapper}>
              <select
                id="request-university"
                className={styles.requestSelect}
                value={requestSelection}
                onChange={(event) => setRequestSelection(event.target.value)}
              >
                <option value="">Выберите из списка</option>
                {kaliningradInstitutions.map((group) => (
                  <optgroup label={group.title} key={group.title}>
                    {group.items.map((option) => {
                      const value = formatInstitutionValue(option);
                      return (
                        <option key={option.id} value={value}>
                          {option.description ? `${option.title} — ${option.description}` : option.title}
                        </option>
                      );
                    })}
                  </optgroup>
                ))}
              </select>
              <ChevronDown size={18} className={styles.selectChevron} />
            </div>
          </div>

          <div className={styles.requestActions}>
            <button
              type="button"
              className={styles.requestSubmit}
              disabled={!requestSelection || isRequestSubmitting}
              onClick={handleRequestSubmit}
            >
              {isRequestSubmitting ? (
                <>
                  <div className={styles.requestSpinner} />
                  <span>Отправляем запрос...</span>
                </>
              ) : (
                'Отправить запрос'
              )}
            </button>
            <span className={styles.requestInfo}>
              После подключения мы автоматически уведомим вас и дадим доступ к разделам вуза.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
