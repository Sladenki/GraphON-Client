'use client'

import UploadForm from '@/components/global/UploadForm/UploadForm';
import { GraphService } from '@/services/graph.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react'
import styles from './createPage.module.scss'
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { useAuth } from '@/providers/AuthProvider';
import { UserRole, IUser } from '@/types/user.interface';
import { UserRoleManager } from '@/components/admin/UserRoleManager/UserRoleManager';
import { CreateGraphForm } from '@/components/admin/CreateGraphForm/CreateGraphForm';
import { CreateEventForm } from '@/components/admin/CreateEventForm/CreateEventForm';
import { useRoleAccess } from '@/hooks/useRoleAccess';

const CreatePost = () => {
    const { user } = useAuth();
    const typedUser = user as IUser | null;
    const { canAccessCreate, canAccessEditor } = useRoleAccess(typedUser?.role);

    // Получение главных графов
    const { isPending, isError, data: mainTopics, error } = useQuery({
        queryKey: ['graph/getParentGraphs'],
        queryFn: () => GraphService.getParentGraphs(),
    });

    if (isPending) return <SpinnerLoader/>;
    if (isError) return <p>Ошибка: {error.message}</p>;

    if (!canAccessEditor) {
        return <p>У вас нет доступа к этой странице</p>
    }

    return (
        <div className={styles.createPostWrapper}>
            {canAccessCreate && <UserRoleManager />}
            {canAccessCreate && mainTopics && <CreateGraphForm mainTopics={mainTopics.data} />}
            {canAccessEditor && mainTopics && <CreateEventForm mainTopics={mainTopics.data} />}
        </div>
    );
};

export default CreatePost;


