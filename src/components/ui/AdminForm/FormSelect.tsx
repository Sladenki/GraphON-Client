import React from 'react';
import styles from './AdminForm.module.scss';

interface Option {
    value: string;
    label: string;
}

interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
    options: Option[];
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
            className={`${styles.select} ${error ? styles.inputError : ''} ${className || ''}`}
            {...props}
        >
            {options.map((option, index) => (
                <option key={`${option.value}-${index}`} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}; 