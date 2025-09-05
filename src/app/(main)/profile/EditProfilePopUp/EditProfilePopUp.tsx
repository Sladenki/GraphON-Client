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

    const [formState, setFormState] = useState<IUpdateUserDto>({ firstName: '', lastName: '', username: '' });

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
                <h3 className={styles.editTitle}>Редактировать профиль</h3>
                <form 
                    className={styles.editForm}
                    onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                            const payload: IUpdateUserDto = {
                                firstName: formState.firstName?.trim() || '',
                                lastName: formState.lastName?.trim() || '',
                                username: formState.username?.trim() || ''
                            };
                            await UserService.updateProfile(payload);
                            if (typedUser) {
                                setUser({ ...typedUser, ...payload } as any);
                            }
                            notifySuccess('Данные обновлены');
                            onClose();
                        } catch (err: any) {
                            notifyError('Не удалось обновить', err?.message || 'Попробуйте позже');
                        }
                    }}
                >
                    <label className={styles.inputGroup}>
                        <span>Имя</span>
                        <input 
                            type="text" 
                            value={formState.firstName || ''}
                            onChange={(e) => setFormState(v => ({ ...v, firstName: e.target.value }))}
                            placeholder="Введите имя"
                            className={styles.input}
                        />
                    </label>
                    <label className={styles.inputGroup}>
                        <span>Фамилия</span>
                        <input 
                            type="text" 
                            value={formState.lastName || ''}
                            onChange={(e) => setFormState(v => ({ ...v, lastName: e.target.value }))}
                            placeholder="Введите фамилию"
                            className={styles.input}
                        />
                    </label>
                    <label className={styles.inputGroup}>
                        <span>Username</span>
                        <input 
                            type="text" 
                            value={formState.username || ''}
                            onChange={(e) => setFormState(v => ({ ...v, username: e.target.value }))}
                            placeholder="Введите username"
                            className={styles.input}
                        />
                    </label>
                    <button type="submit" className={styles.submitBtn}>Обновить данные</button>
                </form>
            </div>
        </PopUpWrapper>
    );
};

export default EditProfilePopUp;


