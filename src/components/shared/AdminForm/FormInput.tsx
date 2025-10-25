import React from 'react';
import styles from './AdminForm.module.scss';

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
            className={`${styles.input} ${error ? styles.inputError : ''} ${className || ''}`}
            {...props}
        />
    );
}; 