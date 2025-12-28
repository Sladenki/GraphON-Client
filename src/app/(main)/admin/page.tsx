'use client'

import { GraphService } from '@/services/graph.service';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react'
import styles from './admin.module.scss'
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
import { VisitorAnalytics } from '@/components/admin/VisitorAnalytics/VisitorAnalytics';
import { DownloadsAnalytics } from '@/components/admin/DownloadsAnalytics/DownloadsAnalytics';
import { CreateGlobalGraphForm } from '@/components/admin/CreateGlobalGraphForm/CreateGlobalGraphForm';
import { CreateTopicGraphForm } from '@/components/admin/CreateTopicGraphForm/CreateTopicGraphForm';
import { GetWeeklySchedule } from '@/components/admin/GetWeeklySchedule/GetWeeklySchedule';
import { useSelectedGraphId } from '@/stores/useUIStore';
import CreateEventModal from '@/components/shared/CreateEventModal/CreateEventModal';
import { Plus } from 'lucide-react';

const Admin = () => {
    const { user } = useAuth();
    const typedUser = user as IUser | null;
    const { canAccessCreate, canAccessEditor, canAccessSysAdmin, canAccessAdmin } = useRoleAccess(typedUser?.role);
    const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
    const [isSuggestEventModalOpen, setIsSuggestEventModalOpen] = useState(false);

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
        <div className={styles.createPostWrapper}>
            {/* Pill-кнопки для создания мероприятия */}
            <div className={styles.createEventPills}>
                <button 
                    className={styles.createPill}
                    onClick={() => setIsCreateEventModalOpen(true)}
                    aria-label="Создать мероприятие"
                >
                    <Plus size={16} />
                    <span>Создать мероприятие</span>
                </button>
                <button 
                    className={styles.suggestPill}
                    onClick={() => setIsSuggestEventModalOpen(true)}
                    aria-label="Предложить мероприятие"
                >
                    <Plus size={16} />
                    <span>Предложить мероприятие</span>
                </button>
            </div>
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
                    title="Аналитика посещаемости"
                    emoji="📈"
                    role={UserRole.Create}
                >
                    <VisitorAnalytics />
                </AdminSection>
            )}

            {canAccessCreate && (
                <AdminSection
                    title="Аналитика скачиваний"
                    emoji="📥"
                    role={UserRole.Create}
                >
                    <DownloadsAnalytics />
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
            
            {canAccessCreate && mainTopics && (
                <AdminSection 
                    title="Создание графа"
                    emoji="📊"
                    role={UserRole.Create}
                >
                    <CreateGraphForm />
                </AdminSection>
            )}

            {(typedUser?.role === UserRole.SysAdmin || typedUser?.role === UserRole.Create) && (
                <AdminSection 
                    title="Статистика сервера"
                    emoji="🖥️"
                    role={UserRole.SysAdmin}
                >
                    <ServerStats />
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
   
            {canAccessEditor && mainTopics && (
                <AdminSection 
                    title="Создание мероприятия"
                    emoji="📅"
                    role={UserRole.Editor}
                >
                    <CreateEventForm globalGraphId={user?.selectedGraphId || ''} />
                </AdminSection>
            )}

            {/* Создание мероприятия для обычных пользователей */}
            {typedUser?.role === UserRole.User && mainTopics && (
                <AdminSection 
                    title="Создание мероприятия"
                    emoji="📅"
                    role={UserRole.User}
                >
                    <CreateEventForm globalGraphId={user?.selectedGraphId || ''} hideGraphDropdown={true} />
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

            <CreateEventModal 
                isOpen={isCreateEventModalOpen} 
                onClose={() => setIsCreateEventModalOpen(false)}
                isSuggestion={false}
            />
            <CreateEventModal 
                isOpen={isSuggestEventModalOpen} 
                onClose={() => setIsSuggestEventModalOpen(false)}
                isSuggestion={true}
            />
        </div>
    );
};

export default Admin;


