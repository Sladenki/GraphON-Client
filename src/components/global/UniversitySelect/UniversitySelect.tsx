import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { UserService } from '@/services/user.service';
import { useSetSelectedGraphId } from '@/stores/useUIStore';
import { BookOpen, Calendar, Clock, Check, RefreshCw } from 'lucide-react';
import styles from './UniversitySelect.module.scss';
import { RequestConnectedGraphService } from '@/services/requestConnectedGraph.service';
import { notifyError, notifySuccess } from '@/lib/notifications';
import { NON_STUDENT_DEFAULT_GRAPH_ID } from '@/constants/nonStudentDefaults';
import { kaliningradInstitutions, InstitutionOption } from './kaliningradInstitutions';
import DropdownSelect, { DropdownOption } from '@/components/ui/DropdownSelect/DropdownSelect';

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

const formatInstitutionValue = (option: InstitutionOption) => {
  if (option.description) {
    return `${option.title} — ${option.description}`;
  }
  return option.title;
};

export const UniversitySelect: React.FC = () => {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const setSelectedGraphId = useSetSelectedGraphId();
  const [selectedUniversity, setSelectedUniversity] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [requestSelection, setRequestSelection] = useState<string>('');
  const [isRequestSubmitting, setIsRequestSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isResettingStatus, setIsResettingStatus] = useState(false);
  const flatInstitutions = useMemo(() => {
    return kaliningradInstitutions.flatMap((group) =>
      group.items.map((option) => ({
        ...option,
        group: group.title,
        value: formatInstitutionValue(option),
      }))
    );
  }, []);

  const dropdownOptions = useMemo<DropdownOption[]>(() => {
    return flatInstitutions.map((option) => ({
      value: option.value,
      label: option.value,
    }));
  }, [flatInstitutions]);

  const handleUniversityClick = (graphId: string) => {
    setSelectedUniversity(graphId);
    setIsOtherSelected(false);
    setRequestSelection('');
    setIsDropdownOpen(false);
  };

  const handleOtherUniversitySelect = () => {
    setIsOtherSelected(true);
    setSelectedUniversity('');
    setTimeout(() => setIsDropdownOpen(true), 0);
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

  const handleStatusReset = async () => {
    if (isResettingStatus) return;
    setIsResettingStatus(true);

    try {
      if (user) {
        // Используем правильный endpoint для обновления статуса студента
        await UserService.updateIsStudent(false);
        setUser({ ...user, isStudent: false } as any);
      }

      setSelectedGraphId(null);
      setSelectedUniversity('');
      setIsOtherSelected(false);
      setRequestSelection('');
      setIsDropdownOpen(false);

      if (typeof window !== 'undefined') {
        localStorage.setItem('isStudent', 'false');
        localStorage.removeItem('selectedGraphId');
      }

      window.dispatchEvent(new Event('studentStatus:reset'));
    } catch (error) {
      console.error('Error resetting student status:', error);
      notifyError('Не удалось вернуться к выбору статуса', 'Попробуйте еще раз');
    } finally {
      setIsResettingStatus(false);
    }
  };

  const handleRequestSubmit = async () => {
    if (!requestSelection || isRequestSubmitting) return;

    setIsRequestSubmitting(true);

    try {
      await RequestConnectedGraphService.createRequest(user?._id ?? null, requestSelection);
      notifySuccess('Запрос отправлен', 'Мы сообщим, как только добавим ваш вуз');
      setRequestSelection('');
      setIsOtherSelected(false);
      setIsDropdownOpen(false);

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

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Добро пожаловать в GraphON!</h1>
      
      <p className={styles.subtitle}>
        Выберите ваш университет, чтобы начать работу
      </p>

      <div className={styles.statusReset}>
        <div className={styles.statusResetIcon}>
          <RefreshCw size={16} />
        </div>
        <span className={styles.statusResetLabel}>Я не студент</span>
        <button
          type="button"
          className={styles.statusResetButton}
          onClick={handleStatusReset}
          disabled={isResettingStatus}
        >
          {isResettingStatus ? 'Возврат...' : 'Вернуться'}
        </button>
      </div>

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

        <button
          type="button"
          className={`${styles.universityCard} ${isOtherSelected ? styles.selected : ''} ${styles.otherOptionCard}`}
          onClick={handleOtherUniversitySelect}
        >
          <div className={styles.radioIndicator}>
            <div className={styles.radioInner} />
          </div>
          
          <div className={styles.cardContent}>
            <h3 className={styles.universityName}>Другой вуз или колледж</h3>
            <p className={styles.universityDescription}>
              Выберите учебное заведение из списка и отправьте заявку на подключение
            </p>
          </div>

          {isOtherSelected && (
            <div className={styles.checkIcon}>
              <Check size={18} />
            </div>
          )}
        </button>

        {isOtherSelected && (
          <div className={styles.requestPanel}>
            <DropdownSelect
              options={dropdownOptions}
              placeholder="Выберите учебное заведение Калининграда"
              label="Список учебных заведений"
              searchable
              searchPlaceholder="Поиск по названию"
              noResultsLabel="Ничего не найдено"
              value={requestSelection}
              onChange={(value) => setRequestSelection(value as string)}
              className={styles.dropdownControl}
              isOpen={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
              autoFocus
            />

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
                  'Отправить заявку'
                )}
              </button>

              <p className={styles.requestInfo}>
                После подключения мы уведомим, а пока покажем события Калининграда.
              </p>
            </div>
          </div>
        )}
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
