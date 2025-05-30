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
import { CreateScheduleForm } from '@/components/admin/CreateScheduleForm/CreateScheduleForm';
import { TransferGraphOwnershipForm } from '@/components/admin/TransferGraphOwnershipForm/TransferGraphOwnershipForm';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { AdminSection } from '@/components/admin/AdminSection/AdminSection';
import { UserStats } from '@/components/admin/UserStats/UserStats';
import { ServerStats } from '@/components/admin/ServerStats/ServerStats';

const CreatePost = () => {
    const { user } = useAuth();
    const typedUser = user as IUser | null;
    const { canAccessCreate, canAccessEditor, canAccessSysAdmin, canAccessAdmin } = useRoleAccess(typedUser?.role);

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
            {canAccessCreate && (
                <AdminSection 
                    title="Статистика пользователей"
                    emoji="📊"
                    role={UserRole.Create}
                >
                    <UserStats />
                </AdminSection>
            )}

            {canAccessCreate && (
                <AdminSection 
                    title="Изменить роль пользователя"
                    emoji="👥"
                    role={UserRole.Create}
                >
                    <UserRoleManager />
                </AdminSection>
            )}
            
            {typedUser?.role === UserRole.SysAdmin || typedUser?.role === UserRole.Create && (
                <AdminSection 
                    title="Статистика сервера"
                    emoji="🖥️"
                    role={UserRole.SysAdmin}
                >
                    <ServerStats />
                </AdminSection>
            )}
            
            {canAccessAdmin && mainTopics && (
                <AdminSection 
                    title="Создание графа"
                    emoji="📊"
                    role={UserRole.Admin}
                >
                    <CreateGraphForm mainTopics={mainTopics.data} />
                </AdminSection>
            )}
            
            {canAccessAdmin && mainTopics && (
                <AdminSection 
                    title="Передача прав на граф"
                    emoji="🔑"
                    role={UserRole.Admin}
                >
                    <TransferGraphOwnershipForm graphs={mainTopics.data} />
                </AdminSection>
            )}
            
            {canAccessEditor && mainTopics && (
                <AdminSection 
                    title="Создание события"
                    emoji="📅"
                    role={UserRole.Editor}
                >
                    <CreateEventForm mainTopics={mainTopics.data} />
                </AdminSection>
            )}
            
            {canAccessEditor && mainTopics && (
                <AdminSection 
                    title="Создание расписания"
                    emoji="⏰"
                    role={UserRole.Editor}
                >
                    <CreateScheduleForm graphs={mainTopics.data} />
                </AdminSection>
            )}
        </div>
    );
};

export default CreatePost;


