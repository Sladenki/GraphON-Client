import React from 'react';
import styles from './AdminForm.module.scss';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
    error,
    className,
    ...props
}) => {
    return (
        <textarea
            className={`${styles.textarea} ${error ? styles.inputError : ''} ${className || ''}`}
            {...props}
        />
    );
}; 