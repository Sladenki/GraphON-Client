import React, { memo, useMemo, useState } from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';
import styles from './AttendeeItem.module.scss';

export interface AttendeeUser {
  _id: string;
  telegramId?: string;
  avaPath?: string;
  firstName?: string;
  username?: string;
  lastName?: string;
}

interface AttendeeItemProps {
  user: AttendeeUser;
  onClick?: (user: AttendeeUser) => void;
  showBadge?: boolean;
}

// Генерация уникального цвета на основе строки
const generateColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 55%)`;
};

const AttendeeItem: React.FC<AttendeeItemProps> = memo(({ 
  user, 
  onClick,
  showBadge = false 
}) => {
  const [imageError, setImageError] = useState(false);

  // Мемоизация вычислений
  const { displayName, initial, avatarColor } = useMemo(() => {
    const fullName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || user.username || 'Пользователь';
    
    const firstLetter = fullName.charAt(0).toUpperCase();
    const colorKey = user.username || fullName || user._id;
    const color = generateColorFromString(colorKey);
    
    return {
      displayName: fullName,
      initial: firstLetter,
      avatarColor: color
    };
  }, [user.firstName, user.lastName, user.username, user._id]);

  const handleClick = () => {
    if (onClick) {
      onClick(user);
    }
  };

  return (
    <div 
      className={`${styles.item} ${onClick ? styles.clickable : ''}`}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.avatarWrapper}>
        <div className={styles.avatar}>
          {user.avaPath && !imageError ? (
            <Image 
              src={user.avaPath} 
              alt={displayName} 
              width={44} 
              height={44}
              className={styles.avatarImage}
              onError={() => setImageError(true)}
            />
          ) : (
            <div 
              className={styles.fallback} 
              style={{ 
                background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}dd)` 
              }}
            >
              {initial}
            </div>
          )}
        </div>
        {showBadge && <div className={styles.onlineBadge} />}
      </div>
      
      <div className={styles.info}>
        <div className={styles.name}>{displayName}</div>
        <div className={styles.meta}>
          {user.username ? (
            <>
              <span className={styles.at}>@</span>
              <span className={styles.username}>{user.username}</span>
            </>
          ) : (
            <span className={styles.noUsername}>без username</span>
          )}
        </div>
      </div>

      {onClick && (
        <div className={styles.arrow}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path 
              d="M7.5 5L12.5 10L7.5 15" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
});

AttendeeItem.displayName = 'AttendeeItem';

export default AttendeeItem;

