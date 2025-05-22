import React from 'react';
import styles from './AdminForm.module.scss';
import { Info } from 'lucide-react';

interface FormInputGroupProps {
    label: string;
    description?: string;
    children: React.ReactNode;
    error?: string;
}

export const FormInputGroup: React.FC<FormInputGroupProps> = ({
    label,
    description,
    children,
    error
}) => {
    return (
        <div className={styles.inputGroup}>
            <div className={styles.labelContainer}>
                <label className={styles.label}>{label}</label>
                {description && (
                    <div className={styles.descriptionContainer}>
                        <Info size={16} className={styles.infoIcon} />
                        <span className={styles.description}>{description}</span>
                    </div>
                )}
            </div>
            {children}
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
}; 