import React from 'react';
import Image from 'next/image';
import styles from './AttendeesPopUp.module.scss';
import { AttendeeUser } from './types';

interface AttendeeItemProps {
  user: AttendeeUser;
}

const AttendeeItem: React.FC<AttendeeItemProps> = ({ user }) => {
  const display = (user.firstName && user.lastName)
    ? `${user.firstName} ${user.lastName}`
    : (user.firstName || user.lastName || user.username || 'Пользователь');

  return (
    <div className={styles.item}>
      <div className={styles.avatar}>
        {user.avaPath ? (
          <Image src={user.avaPath} alt={display} width={40} height={40} />
        ) : (
          <div className={styles.fallback}>{display.charAt(0).toUpperCase()}</div>
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


