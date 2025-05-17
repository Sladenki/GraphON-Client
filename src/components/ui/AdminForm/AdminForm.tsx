import React from 'react';
import styles from './AdminForm.module.scss';

interface AdminFormProps {
    title: string;
    onSubmit: (e: React.FormEvent) => void;
    children: React.ReactNode;
    submitButtonText: string;
    isSubmitting?: boolean;
    isSubmitDisabled?: boolean;
}

export const AdminForm: React.FC<AdminFormProps> = ({
    title,
    onSubmit,
    children,
    submitButtonText,
    isSubmitting = false,
    isSubmitDisabled = false
}) => {
    const [showValidationMessage, setShowValidationMessage] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitDisabled) {
            setShowValidationMessage(true);
            return;
        }
        setShowValidationMessage(false);
        onSubmit(e);
    };

    return (
        <div className={styles.container}>
            <h2>{title}</h2>
            
            <form onSubmit={handleSubmit} className={styles.form}>
                {children}
                
                {showValidationMessage && (
                    <div className={styles.validationMessage}>
                        Не все поля заполнены
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isSubmitDisabled || isSubmitting}
                    className={styles.submitButton}
                >
                    {isSubmitting ? 'Загрузка...' : submitButtonText}
                </button>
            </form>
        </div>
    );
}; 