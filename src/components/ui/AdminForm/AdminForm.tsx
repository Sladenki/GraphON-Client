import React from 'react';
import styles from './AdminForm.module.scss';

interface AdminFormProps {
    title?: string;
    onSubmit: (e: React.FormEvent) => void;
    submitButtonText: string;
    isSubmitting?: boolean;
    isSubmitDisabled?: boolean;
    children: React.ReactNode;
}

export const AdminForm: React.FC<AdminFormProps> = ({
    title,
    onSubmit,
    submitButtonText,
    isSubmitting = false,
    isSubmitDisabled = false,
    children
}) => {
    return (
        <form className={styles.form} onSubmit={onSubmit}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {children}
            <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting || isSubmitDisabled}
            >
                {isSubmitting ? 'Загрузка...' : submitButtonText}
            </button>
        </form>
    );
};

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
            <label className={styles.label}>{label}</label>
            {children}
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
};

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
    error,
    className,
    ...props
}) => {
    return (
        <input
            className={`${styles.input} ${error ? styles.error : ''} ${className || ''}`}
            {...props}
        />
    );
};

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: { value: string; label: string }[];
    error?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
    options,
    error,
    className,
    ...props
}) => {
    return (
        <select
            className={`${styles.select} ${error ? styles.error : ''} ${className || ''}`}
            {...props}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}; 