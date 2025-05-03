import React, { useState } from 'react';
import styles from './AdminSection.module.scss';

interface AdminSectionProps {
    title: string;
    emoji: string;
    children: React.ReactNode;
}

export const AdminSection: React.FC<AdminSectionProps> = ({ title, emoji, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={styles.section}>
            <div 
                className={styles.header}
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3>
                    <span className={styles.emoji}>{emoji}</span>
                    {title}
                </h3>
                <span className={`${styles.arrow} ${isOpen ? styles.open : ''}`}>▼</span>
            </div>
            {isOpen && (
                <div className={styles.content}>
                    {children}
                </div>
            )}
        </div>
    );
}; 