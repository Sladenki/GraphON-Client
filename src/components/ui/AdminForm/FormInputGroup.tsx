import React from 'react';
import styles from './AdminForm.module.scss';

interface FormInputGroupProps {
    label: string;
    children: React.ReactNode;
    error?: string;
}

export const FormInputGroup: React.FC<FormInputGroupProps> = ({
    label,
    children,
    error
}) => {
    return (
        <div className={styles.inputGroup}>
            <label>{label}</label>
            {children}
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
}; 