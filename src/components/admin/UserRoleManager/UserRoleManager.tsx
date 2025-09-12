import { useState } from 'react';
import { UserService } from '@/services/user.service';
import { AdminService } from '@/services/admin.service';
import { IUser, UserRole, RoleTitles } from '@/types/user.interface';
import styles from './UserRoleManager.module.scss';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { useSelectedGraphId } from '@/stores/useUIStore';
import { useAuth } from '@/providers/AuthProvider';

export const UserRoleManager = () => {
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.User);
    const queryClient = useQueryClient();
    const selectedGraphId = useSelectedGraphId();
    const { user } = useAuth();
    const isAdminUser = user?.role === UserRole.Admin;

    const {
        data,
        isLoading: isLoadingUsers
    } = useQuery({
        queryKey: ['usersByGraph', selectedGraphId],
        queryFn: () => UserService.getAllUsersByGraph(selectedGraphId as string),
        enabled: Boolean(selectedGraphId),
        refetchOnWindowFocus: false,
        refetchOnMount: false
    });

    const users = data || [];

    const availableRolesEntries = Object.entries(RoleTitles).filter(([roleKey]) => {
        // Админ не может назначать владельцев и сис.админов
        if (isAdminUser && (roleKey === UserRole.Create || roleKey === UserRole.SysAdmin)) return false;
        return true;
    }) as Array<[UserRole, string]>;

    const { mutate: assignRole, isPending: isAssigningRole } = useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: UserRole }) => {
            if (isAdminUser && (role === UserRole.Create || role === UserRole.SysAdmin)) {
                throw new Error('Администратор не может назначать роль Владелец или Сис.Админ');
            }
            return AdminService.assignRole(userId, role);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['usersByGraph', selectedGraphId] });
            alert('Роль успешно изменена');
            setSelectedUser('');
        },
        onError: (error) => {
            console.error('Failed to assign role:', error);
            alert('Ошибка при изменении роли');
        }
    });

    const handleAssignRole = () => {
        if (!selectedUser) return;
        assignRole({ userId: selectedUser, role: selectedRole });
    };

    if (isLoadingUsers) {
        return <SpinnerLoader />;
    }

    return (
        <div className={styles.container}>
            <h2>Управление ролями пользователей</h2>
            
            <div className={styles.controls}>
                <select 
                    value={selectedUser} 
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className={styles.select}
                >
                    <option value="">Выберите пользователя</option>
                    {users.map((user: IUser) => (
                        <option key={user._id} value={user._id}>
                            {user.firstName} {user.lastName} ({user.username})
                        </option>
                    ))}
                </select>

                <select 
                    value={selectedRole} 
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className={styles.select}
                >
                    {availableRolesEntries.map(([role, title]) => (
                        <option key={role} value={role}>
                            {title}
                        </option>
                    ))}
                </select>

                <button 
                    onClick={handleAssignRole}
                    disabled={!selectedUser || isAssigningRole}
                    className={styles.button}
                >
                    {isAssigningRole ? 'Изменение...' : 'Изменить роль'}
                </button>
            </div>
        </div>
    );
}; 