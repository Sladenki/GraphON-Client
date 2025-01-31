import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react'

import styles from './LogOut.module.scss'

const LogOut = () => {

  const { push } = useRouter();

  const { logout } = useAuth();

  const handleLogout = async () => {
      await logout();
      push("/"); // Перенаправление на главную страницу после выхода
    };

  return (
    <Link href="#" onClick={handleLogout} className={styles.logoutLink}>
        Выйти
    </Link>
  )
}

export default LogOut
