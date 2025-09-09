import React from 'react';
import Image from 'next/image';
import styles from './AttendeesPopUp.module.scss';
import { AttendeeUser } from './types';

interface AttendeeItemProps {
  user: AttendeeUser;
}

const stringToHslColor = (str: string, saturation = 65, lightness = 55) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const AttendeeItem: React.FC<AttendeeItemProps> = ({ user }) => {
  const display = (user.firstName && user.lastName)
    ? `${user.firstName} ${user.lastName}`
    : (user.firstName || user.lastName || user.username || 'Пользователь');
  const initial = display.charAt(0).toUpperCase();
  const colorKey = user.username || display || user._id;
  const bgColor = stringToHslColor(colorKey);

  return (
    <div className={styles.item}>
      <div className={styles.avatar}>
        {user.avaPath ? (
          <Image src={user.avaPath} alt={display} width={40} height={40} />
        ) : (
          <div className={styles.fallback} style={{ backgroundColor: bgColor }}>{initial}</div>
        )}
      </div>
      <div className={styles.info}>
        <div className={styles.name}>{display}</div>
        <div className={styles.meta}>@{user.username || '—'}</div>
      </div>
    </div>
  );
};

export default AttendeeItem;


