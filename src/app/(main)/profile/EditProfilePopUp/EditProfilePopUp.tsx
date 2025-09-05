"use client";

import React, { useEffect, useState } from 'react';
import PopUpWrapper from '@/components/global/PopUpWrapper/PopUpWrapper';
import styles from './EditProfilePopUp.module.scss';
import { IUpdateUserDto, IUser } from '@/types/user.interface';
import { UserService } from '@/services/user.service';
import { notifyError, notifySuccess } from '@/lib/notifications';
import { useAuth } from '@/providers/AuthProvider';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface EditProfilePopUpProps {
    isOpen: boolean;
    onClose: () => void;
}

const EditProfilePopUp: React.FC<EditProfilePopUpProps> = ({ isOpen, onClose }) => {
    const { user, setUser } = useAuth();
    const typedUser = user as IUser | null;
    const small = useMediaQuery('(max-width: 650px)');
    const isUsernameLocked = Boolean(typedUser?.username && typedUser.username.trim() !== '');

    const [formState, setFormState] = useState<IUpdateUserDto>({ firstName: '', lastName: '', username: '' });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (typedUser) {
            setFormState({
                firstName: typedUser.firstName || '',
                lastName: typedUser.lastName || '',
                username: typedUser.username || ''
            });
        } else {
            setFormState({ firstName: '', lastName: '', username: '' });
        }
    }, [typedUser?.firstName, typedUser?.lastName, typedUser?.username, isOpen]);

    return (
        <PopUpWrapper 
            isOpen={isOpen}
            onClose={onClose}
            width={small ? '92vw' : 520}
            modalId="edit-profile-popup"
        >
            <div className={styles.editFormWrapper}>
                <div className={styles.formHeader}>
                    <h3 className={styles.editTitle}>Редактировать профиль</h3>
                    <p className={styles.description}>Заполните или обновите основные данные профиля. Эти данные видят другие пользователи.</p>
                </div>
                <form 
                    className={styles.editForm}
                    onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                            setIsSubmitting(true);
                            const payload: IUpdateUserDto = {
                                firstName: formState.firstName?.trim() || '',
                                lastName: formState.lastName?.trim() || ''
                            };
                            if (!isUsernameLocked) {
                                const rawUsername = (formState.username || '').trim();
                                // Extract Telegram handle from various formats: @name, t.me/name, https://t.me/name
                                const urlMatch = rawUsername.match(/^(?:https?:\/\/)?(?:t(?:elegram)?\.me)\/([^\/?#]+)/i);
                                let handle = '';
                                if (urlMatch && urlMatch[1]) {
                                    handle = urlMatch[1];
                                } else {
                                    // Fallback: remove leading @ and take last segment after '/'
                                    const noAt = rawUsername.replace(/^@+/, '');
                                    const parts = noAt.split('/');
                                    handle = parts[parts.length - 1] || '';
                                }
                                // Clean trailing slashes and keep only allowed chars
                                handle = handle.replace(/\/+$/, '').replace(/[^A-Za-z0-9_]/g, '');
                                if (handle) {
                                    payload.username = handle;
                                }
                            }
                            await UserService.updateProfile(payload);
                            if (typedUser) {
                                setUser({ ...typedUser, ...payload } as any);
                            }
                            notifySuccess('Данные обновлены');
                            onClose();
                        } catch (err: any) {
                            notifyError('Не удалось обновить', err?.message || 'Попробуйте позже');
                        } finally {
                            setIsSubmitting(false);
                        }
                    }}
                >
                    <div className={styles.formGrid}>
                        <label className={styles.inputGroup}>
                            <span className={styles.fieldLabel}>Имя</span>
                            <input 
                                type="text"
                                name="firstName"
                                value={formState.firstName || ''}
                                onChange={(e) => setFormState(v => ({ ...v, firstName: e.target.value }))}
                                placeholder="Иван"
                                className={styles.input}
                                autoComplete="given-name"
                            />
                            <span className={styles.fieldHint}>Как к вам обращаться</span>
                        </label>
                        <label className={styles.inputGroup}>
                            <span className={styles.fieldLabel}>Фамилия</span>
                            <input 
                                type="text"
                                name="lastName"
                                value={formState.lastName || ''}
                                onChange={(e) => setFormState(v => ({ ...v, lastName: e.target.value }))}
                                placeholder="Иванов"
                                className={styles.input}
                                autoComplete="family-name"
                            />
                            <span className={styles.fieldHint}>Необязательное поле</span>
                        </label>
                        <label className={styles.inputGroup}>
                            <span className={styles.fieldLabel}>Username</span>
                            <input 
                                type="text"
                                name="username"
                                value={formState.username || ''}
                                onChange={(e) => setFormState(v => ({ ...v, username: e.target.value }))}
                                placeholder={isUsernameLocked ? '' : 'ivan123'}
                                className={styles.input}
                                disabled={isUsernameLocked}
                                autoComplete="username"
                            />
                            <span className={styles.fieldHint}>
                                {isUsernameLocked ? 'Username уже установлен и не может быть изменён' : 'Будет отображаться как @username'}
                            </span>
                        </label>
                    </div>
                    <div className={styles.divider} />
                    <div className={styles.actions}>
                        <button 
                            type="button" 
                            className={styles.secondaryBtn}
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Отмена
                        </button>
                        <button 
                            type="submit" 
                            className={styles.submitBtn}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Сохранение…' : 'Сохранить'}
                        </button>
                    </div>
                </form>
            </div>
        </PopUpWrapper>
    );
};

export default EditProfilePopUp;


