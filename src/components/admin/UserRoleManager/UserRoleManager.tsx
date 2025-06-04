import { useState, useRef, useEffect } from 'react';
import { UserService } from '@/services/user.service';
import { AdminService } from '@/services/admin.service';
import { IUser, UserRole, RoleTitles } from '@/types/user.interface';
import styles from './UserRoleManager.module.scss';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';

export const UserRoleManager = () => {
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.User);
    const queryClient = useQueryClient();
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const {
        data,
        isLoading: isLoadingUsers,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['users'],
        queryFn: ({ pageParam }: { pageParam: string | undefined }) => 
            UserService.getAllUsers(pageParam),
        getNextPageParam: (lastPage) => {
            const lastUser = lastPage.users[lastPage.users.length - 1];
            return lastPage.hasMore ? lastUser?._id : undefined;
        },
        initialPageParam: undefined as string | undefined,
        refetchOnWindowFocus: false,
        refetchOnMount: false
    });

    const users = data?.pages.flatMap(page => page.users) || [];

    useEffect(() => {
        if (!hasNextPage) {
            console.log('No more pages to load');
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                const rect = target.boundingClientRect;
                const isAtBottom = rect.bottom <= window.innerHeight + 100;

                if (target.isIntersecting && isAtBottom && hasNextPage && !isFetchingNextPage) {
                    console.log('Fetching next page, hasNextPage:', hasNextPage);
                    fetchNextPage();
                }
            },
            { 
                threshold: [0, 1.0],
                rootMargin: '0px'
            }
        );

        const currentRef = loadMoreRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
            observer.disconnect();
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
                    {users.map(user => (
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

            {hasNextPage && (
                <div ref={loadMoreRef} className={styles.loadMore}>
                    {isFetchingNextPage ? <SpinnerLoader /> : null}
                </div>
            )}
        </div>
    );
}; 