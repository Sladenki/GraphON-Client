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
    const [searchQuery, setSearchQuery] = useState<string>('');
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

    const filteredUsers: IUser[] = (users as IUser[]).filter((u) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
        const username = (u.username || '').toLowerCase();
        const roleTitle = RoleTitles[u.role].toLowerCase();
        return (
            fullName.includes(q) ||
            username.includes(q) ||
            roleTitle.includes(q)
        );
    });

    const selectedUserObj = (users as IUser[]).find((u) => u._id === selectedUser) || null;

    const handleSelectUser = (u: IUser) => {
        setSelectedUser(u._id);
        const allowedRoles = availableRolesEntries.map(([role]) => role);
        const nextRole = allowedRoles.includes(u.role) ? u.role : allowedRoles[0];
        if (nextRole) setSelectedRole(nextRole);
    };

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
                <div className={styles.userPicker}>
                    <div className={styles.searchRow}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Поиск пользователей по имени, username или роли..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className={styles.userList}>
                        {filteredUsers.map((u: IUser) => {
                            const isActive = selectedUser === u._id;
                            return (
                                <button
                                    key={u._id}
                                    type="button"
                                    className={`${styles.userItem} ${isActive ? styles.userItemActive : ''}`}
                                    onClick={() => handleSelectUser(u)}
                                >
                                    <div className={styles.avatar} aria-hidden>
                                        {(u.firstName?.[0] || u.username?.[0] || '?').toUpperCase()}
                                    </div>
                                    <div className={styles.userInfo}>
                                        <div className={styles.name}>
                                            {u.firstName} {u.lastName}
                                        </div>
                                        <div className={styles.username}>@{u.username}</div>
                                    </div>
                                    <span
                                        className={`${styles.roleBadge} ${
                                            u.role === UserRole.Create ? styles.roleCreate :
                                            u.role === UserRole.Admin ? styles.roleAdmin :
                                            u.role === UserRole.Editor ? styles.roleEditor :
                                            u.role === UserRole.SysAdmin ? styles.roleSysAdmin :
                                            styles.roleUser
                                        }`}
                                    >
                                        {RoleTitles[u.role]}
                                    </span>
                                </button>
                            );
                        })}
                        {filteredUsers.length === 0 && (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon} aria-hidden>🔎</div>
                                <div className={styles.emptyTitle}>Пользователи не найдены</div>
                                <div className={styles.emptyDesc}>
                                    Уточните запрос. Возможно, пользователь ещё не зарегистрирован или у него не выбран глобальный граф в профиле.
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.rolePanel}>
                    <div className={styles.panelTitle}>Назначение роли</div>

                    <div className={styles.selectedUserCard}>
                        {selectedUserObj ? (
                            <>
                                <div className={styles.selectedUserHeader}>
                                    <div className={styles.avatarSmall} aria-hidden>
                                        {(selectedUserObj.firstName?.[0] || selectedUserObj.username?.[0] || '?').toUpperCase()}
                                    </div>
                                    <div>
                                        <div className={styles.name}>{selectedUserObj.firstName} {selectedUserObj.lastName}</div>
                                        <div className={styles.username}>@{selectedUserObj.username}</div>
                                    </div>
                                </div>
                                <div className={styles.currentRoleRow}>
                                    <span className={styles.muted}>Текущая роль:</span>
                                    <span className={`${styles.roleBadge} ${
                                        selectedUserObj.role === UserRole.Create ? styles.roleCreate :
                                        selectedUserObj.role === UserRole.Admin ? styles.roleAdmin :
                                        selectedUserObj.role === UserRole.Editor ? styles.roleEditor :
                                        selectedUserObj.role === UserRole.SysAdmin ? styles.roleSysAdmin :
                                        styles.roleUser
                                    }`}>{RoleTitles[selectedUserObj.role]}</span>
                                </div>
                            </>
                        ) : (
                            <div className={styles.muted}>Пользователь не выбран</div>
                        )}
                    </div>

                    <div className={styles.formRow}>
                        <label className={styles.label}>Новая роль</label>
                        <select 
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                            className={styles.select}
                            disabled={!selectedUser}
                        >
                            {availableRolesEntries.map(([role, title]) => (
                                <option key={role} value={role}>
                                    {title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={handleAssignRole}
                        disabled={!selectedUser || isAssigningRole}
                        className={styles.button}
                    >
                        {isAssigningRole ? 'Изменение...' : 'Изменить роль'}
                    </button>
                </div>
            </div>
        </div>
    );
}; 