'use client'

import { GraphService } from '@/services/graph.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react'
import styles from './adminPanel.module.scss'
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
import { CreateGlobalGraphForm } from '@/components/admin/CreateGlobalGraphForm/CreateGlobalGraphForm';
import { CreateTopicGraphForm } from '@/components/admin/CreateTopicGraphForm/CreateTopicGraphForm';
import { GetWeeklySchedule } from '@/components/admin/GetWeeklySchedule/GetWeeklySchedule';
import { useSelectedGraphId } from '@/stores/useUIStore';

const AdminPanel = () => {
    const { user } = useAuth();
    const typedUser = user as IUser | null;
    const { canAccessCreate, canAccessEditor, canAccessSysAdmin, canAccessAdmin } = useRoleAccess(typedUser?.role);

    // Получение дочерних графов выбранного графа
    const selectedGraphId = useSelectedGraphId();
    const { isPending, isError, data: mainTopics, error } = useQuery({
        queryKey: ['graph/getAllChildrenGraphs', selectedGraphId],
        queryFn: () => GraphService.getAllChildrenGraphs(selectedGraphId as string),
        enabled: Boolean(selectedGraphId),
    });

    if (isPending) return <SpinnerLoader/>;
    if (isError) return <p>Ошибка: {error.message}</p>;

    return (
        <div className={styles.adminPanelWrapper}>
            {canAccessCreate && (
                <AdminSection 
                    title="Статистика пользователей"
                    emoji="📊"
                    role={UserRole.Create}
                >
                    <UserStats />
                </AdminSection>
            )}

            {canAccessAdmin && (
                <AdminSection 
                    title="Изменить роль пользователя"
                    emoji="👥"
                    role={UserRole.Admin}
                >
                    <UserRoleManager />
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

            {canAccessCreate && (
                <AdminSection 
                    title="Создание глобального графа"
                    emoji="🌍"
                    role={UserRole.Create}
                >
                    <CreateGlobalGraphForm />
                </AdminSection>
            )}

            {canAccessCreate && mainTopics && (
                <AdminSection 
                    title="Создание графа-тематики"
                    emoji="📑"
                    role={UserRole.Create}
                >
                    <CreateTopicGraphForm />
                </AdminSection>
            )}
            
            {canAccessSysAdmin && canAccessCreate && (
                <AdminSection 
                    title="Статистика сервера"
                    emoji="🖥️"
                    role={UserRole.SysAdmin}
                >
                    <ServerStats />
                </AdminSection>
            )}

            {/* Вернуть на Admin */}
            {canAccessCreate && mainTopics && (
                <AdminSection 
                    title="Создание графа"
                    emoji="📊"
                    role={UserRole.Create}
                >
                    <CreateGraphForm />
                </AdminSection>
            )}
            

            
            {canAccessEditor && mainTopics && (
                <AdminSection 
                    title="Создание события (мероприятия)"
                    emoji="📅"
                    role={UserRole.Editor}
                >
                    <CreateEventForm globalGraphId={user?.selectedGraphId || ''} />
                </AdminSection>
            )}
            
            {canAccessEditor && mainTopics && (
                <AdminSection 
                    title="Создание расписания"
                    emoji="⏰"
                    role={UserRole.Editor}
                >
                    <CreateScheduleForm globalGraphId={user?.selectedGraphId || ''} />
                </AdminSection>
            )}

            {canAccessEditor && (
                <AdminSection 
                    title="Получить расписание по ВУЗу"
                    emoji="📆"
                    role={UserRole.Editor}
                >
                    <GetWeeklySchedule />
                </AdminSection>
            )}
        </div>
    );
};

export default AdminPanel;


