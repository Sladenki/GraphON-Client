'use client'

import UploadForm from '@/components/global/UploadForm/UploadForm';
import { GraphService } from '@/services/graph.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react'
import styles from './createPage.module.scss'
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import SelectGraph from './SelectGraph/SelectGraph';
import { useAuth } from '@/providers/AuthProvider';
import { UserRole, IUser } from '@/types/user.interface';
import { UserRoleManager } from '@/components/admin/UserRoleManager/UserRoleManager';


const CreatePost = () => {

    const { user } = useAuth();
    const typedUser = user as IUser | null;
    const isAdmin = typedUser?.role === UserRole.Create;

    const [selectedGraph, setSelectedGraph] = useState('');

    // Получение главных графов
    const { isPending, isError, data: mainTopics, error } = useQuery({
        queryKey: ['graph/getParentGraphs'],
        queryFn: () => GraphService.getParentGraphs(),
    });

    if (isPending) return <SpinnerLoader/>;
    if (isError) return <p>Ошибка: {error.message}</p>;

    // @ts-expect-error ошибка типизации
    if (user?.role === UserRole.User) {
        return <p>Тебя тут не должно быть</p>
    }


  return (
    <div className={styles.createPostWrapper}>
        {isAdmin && <UserRoleManager />}

        {/* Показываем пока не выбрали граф */}
        {!selectedGraph && (
            <span className={styles.warningText}>
                ⚠️ Пожалуйста, выберите граф для создания мероприятия
            </span>
        )}

        {/* Поиск по графам + Создание нового графа + Список доступных графов */}
        {mainTopics && (
            <SelectGraph
                mainTopics={mainTopics.data}
                selectedGraph={selectedGraph}
                setSelectedGraph={setSelectedGraph}
            />
        )}


      
    </div>
  );
};

export default CreatePost;


