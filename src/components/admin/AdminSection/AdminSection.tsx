import React, { useState } from 'react';
import styles from './AdminSection.module.scss';
import { UserRole } from '@/types/user.interface';
import { ChevronDown } from 'lucide-react';

interface AdminSectionProps {
    title: string;
    emoji: string;
    children: React.ReactNode;
    role?: UserRole;
}

export const AdminSection: React.FC<AdminSectionProps> = ({ title, emoji, children, role }) => {
    const [isOpen, setIsOpen] = useState(false);

    const getRoleLabel = (role?: UserRole) => {
        switch (role) {
            case UserRole.Create:
                return 'Владелец';
            case UserRole.Admin:
                    return 'Администратор';
            case UserRole.Editor:
                return 'Редактор'
            case UserRole.SysAdmin:
                return 'Системный администратор';
            default:
                return '';
        }
    };

    return (
        <div className={styles.section}>
            <div 
                className={styles.header}
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3>
                    <span className={styles.emoji}>{emoji}</span>
                    {title}
                    {role && (
                        <span className={styles.roleLabel}>
                            {getRoleLabel(role)}
                        </span>
                    )}
                </h3>
                <button 
                    className={`${styles.arrow} ${isOpen ? styles.open : ''}`}
                    aria-label={isOpen ? 'Свернуть' : 'Развернуть'}
                >
                    <ChevronDown size={18} strokeWidth={2} />
                </button>
            </div>
            {isOpen && (
                <div className={styles.content}>
                    {children}
                </div>
            )}
        </div>
    );
}; 