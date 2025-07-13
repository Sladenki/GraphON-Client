import styles from './MissingDataMessage.module.scss';

interface MissingDataMessageProps {
  missingFields: string[];
}

export default function MissingDataMessage({ missingFields }: MissingDataMessageProps) {
  if (missingFields.length === 0) return null;

  const getFieldNames = (fields: string[]) => {
    const fieldMap: Record<string, string> = {
      firstName: 'имя',
      lastName: 'фамилия',
      username: 'имя пользователя'
    };
    
    return fields.map(field => fieldMap[field] || field).join(', ');
  };

  return (
    <div className={styles.missingDataContainer}>
      <div className={styles.icon}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
        </svg>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>Не удалось получить данные из Telegram</h3>
        <p className={styles.description}>
          Следующие данные не были получены: <strong>{getFieldNames(missingFields)}</strong>. 
          Это может быть связано с тем, что они скрыты в настройках приватности или не указаны в вашем профиле Telegram.
        </p>
        <p className={styles.note}>
          В скором времени мы добавим возможность вручную добавлять эти данные. Спасибо за понимание!
        </p>
      </div>
    </div>
  );
} 