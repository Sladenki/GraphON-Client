import { useState } from 'react';
import { UserService } from '@/services/user.service';
import { AdminService } from '@/services/admin.service';
import { IUser, UserRole, RoleTitles } from '@/types/user.interface';
import styles from './UserRoleManager.module.scss';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';

export const UserRoleManager = () => {
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.User);
    const queryClient = useQueryClient();

    const { data: users, isLoading: isLoadingUsers } = useQuery({
        queryKey: ['users'],
        queryFn: () => UserService.getAllUsers()
    });

    const { mutate: assignRole, isPending: isAssigningRole } = useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: UserRole }) => 
            AdminService.assignRole(userId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
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
                    {users?.map(user => (
                        <option key={user._id} value={user._id}>
                            {user.firstName} {user.lastName} ({user.email})
                        </option>
                    ))}
                </select>

                <select 
                    value={selectedRole} 
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className={styles.select}
                >
                    {Object.entries(RoleTitles).map(([role, title]) => (
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