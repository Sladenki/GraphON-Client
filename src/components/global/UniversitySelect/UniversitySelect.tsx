import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { UserService } from '@/services/user.service';
import { useSetSelectedGraphId } from '@/stores/useUIStore';
import { BookOpen, Calendar, Clock, Check, GraduationCap } from 'lucide-react';
import styles from './UniversitySelect.module.scss';
import { RequestConnectedGraphService } from '@/services/requestConnectedGraph.service';
import { notifyError, notifySuccess } from '@/lib/notifications';
import { NON_STUDENT_DEFAULT_GRAPH_ID } from '@/constants/nonStudentDefaults';

interface University {
  name: string;
  graphId: string;
  description: string;
}

interface InstitutionOption {
  id: string;
  title: string;
  description: string;
}

interface InstitutionGroup {
  title: string;
  items: InstitutionOption[];
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

const kaliningradInstitutions: InstitutionGroup[] = [
  {
    title: '🎓 Вузы',
    items: [
      {
        id: 'bfu',
        title: 'БФУ им. И. Канта',
        description: 'Балтийский федеральный университет'
      },
      {
        id: 'bgarf',
        title: 'БГАРФ',
        description: 'Балтийская государственная академия рыбопромыслового флота'
      },
      {
        id: 'bvmw',
        title: 'БВМУ / ВМУ им. Ушакова',
        description: 'Балтийское высшее военно-морское училище им. Ф. Ф. Ушакова'
      },
      {
        id: 'kpifsb',
        title: 'КПИ ФСБ',
        description: 'Калининградский пограничный институт ФСБ России'
      },
      {
        id: 'ranhigs',
        title: 'РАНХиГС (филиал)',
        description: 'Российская академия народного хозяйства и госслужбы'
      },
      {
        id: 'mvd',
        title: 'Московский университет МВД (филиал)',
        description: ''
      },
      {
        id: 'miit',
        title: 'МИИТ / РУТ (филиал)',
        description: 'Российский университет транспорта'
      },
      {
        id: 'mpgu',
        title: 'МПГУ (филиал)',
        description: 'Московский педагогический государственный университет'
      },
      {
        id: 'rgsu',
        title: 'РГСУ (филиал)',
        description: 'Российский государственный социальный университет'
      }
    ]
  },
  {
    title: '🎓 Колледжи и техникумы (СПО)',
    items: [
      {
        id: 'ktk',
        title: 'КТК',
        description: 'Калининградский технический колледж'
      },
      {
        id: 'kmk',
        title: 'КМК',
        description: 'Калининградский морской колледж'
      },
      {
        id: 'kpt',
        title: 'КПТ',
        description: 'Калининградский политехнический техникум'
      },
      {
        id: 'kgmk',
        title: 'КГМК',
        description: 'Калининградский городской многопрофильный колледж'
      },
      {
        id: 'ket',
        title: 'КЭТ',
        description: 'Калининградский экономический техникум'
      },
      {
        id: 'kteis',
        title: 'КТЭиС',
        description: 'Колледж торговли, экономики и сервиса'
      },
      {
        id: 'kki',
        title: 'ККИ',
        description: 'Калининградский колледж индустрии'
      },
      {
        id: 'bmk',
        title: 'БМК',
        description: 'Балтийский морской колледж'
      },
      {
        id: 'muz',
        title: 'МузКолледж',
        description: 'Калининградский областной музыкальный колледж'
      },
      {
        id: 'ped',
        title: 'ПедКолледж',
        description: 'Калининградский педагогический колледж'
      },
      {
        id: 'med',
        title: 'МедКолледж',
        description: 'Калининградский медицинский колледж'
      },
      {
        id: 'kst',
        title: 'Строительный техникум (КСТ)',
        description: ''
      }
    ]
  }
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
        router.push('/');
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

          {kaliningradInstitutions.map((group) => (
            <div key={group.title} className={styles.requestGroup}>
              <p className={styles.groupTitle}>{group.title}</p>

              <div className={styles.requestOptions}>
                {group.items.map((option) => {
                  const value = formatInstitutionValue(option);
                  const isSelected = requestSelection === value;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`${styles.requestOptionCard} ${isSelected ? styles.selected : ''}`}
                      onClick={() => setRequestSelection(value)}
                    >
                      <div className={styles.optionContent}>
                        <span className={styles.optionTitle}>{option.title}</span>
                        {option.description && (
                          <span className={styles.optionDescription}>{option.description}</span>
                        )}
                      </div>
                      {isSelected && (
                        <div className={styles.optionCheck}>
                          <Check size={16} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

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
              'Отправить запрос на подключение'
            )}
          </button>
        </div>
      )}
    </div>
  );
};
