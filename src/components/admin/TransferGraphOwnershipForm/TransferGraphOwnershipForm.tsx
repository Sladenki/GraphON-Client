import { AdminService } from '@/services/admin.service';
import { UserService } from '@/services/user.service';
import { IUser, RoleTitles } from '@/types/user.interface';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AdminForm } from '@/components/ui/AdminForm';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { useSelectedGraphId as useSelectedGraphIdStore } from '@/stores/useUIStore';
import { GraphService } from '@/services/graph.service';
import styles from './TransferGraphOwnershipForm.module.scss';
import { notifyError, notifySuccess } from '@/lib/notifications';

interface GraphOwnerEmbedded {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    avaPath?: string;
}

interface TransferGraphOwnershipFormProps {
    graphs: Array<{ _id: string; name: string; ownerUserId?: string | GraphOwnerEmbedded }>;
}

export const TransferGraphOwnershipForm = ({ graphs }: TransferGraphOwnershipFormProps) => {
    const selectedGlobalGraphId = useSelectedGraphIdStore();
    const [selectedGraphId, setSelectedGraphId] = useState(selectedGlobalGraphId ?? '');
    
    
    useEffect(() => {
        if (selectedGlobalGraphId) {
            setSelectedGraphId(selectedGlobalGraphId);
        }
    }, [selectedGlobalGraphId]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const queryClient = useQueryClient();

    const {
        data,
        isLoading: isLoadingUsers
    } = useQuery({
        queryKey: ['usersByGraph', selectedGlobalGraphId],
        queryFn: () => UserService.getAllUsersByGraph(selectedGlobalGraphId as string),
        enabled: Boolean(selectedGlobalGraphId),
        refetchOnWindowFocus: false,
        refetchOnMount: false
    });

    const users: IUser[] = data || [];

    // Build owner lookup by graphId with full user object
    const [ownerByGraphId, setOwnerByGraphId] = useState<Record<string, { _id: string; firstName: string; lastName: string; username: string } | null>>({});

    useEffect(() => {
        const fetchOwners = async () => {
            // Prefer owners embedded in graphs prop; only fetch where missing
            const nextFromProp: Record<string, any> = {};
            graphs.forEach(g => {
                const maybe = (g as any).ownerUserId;
                if (maybe && typeof maybe === 'object') {
                    nextFromProp[g._id] = maybe;
                }
            });
            if (Object.keys(nextFromProp).length) {
                setOwnerByGraphId(prev => ({ ...nextFromProp, ...prev }));
            }

            const missing = graphs.filter(g => ownerByGraphId[g._id] === undefined && !nextFromProp[g._id]);
            if (missing.length === 0) return;
            try {
                const results = await Promise.all(
                    missing.map(async (g) => {
                        const info = await GraphService.getGraphById(g._id);
                        const owner = info.ownerUserId && typeof info.ownerUserId === 'object'
                            ? info.ownerUserId as any
                            : null;
                        return { id: g._id, owner };
                    })
                );
                setOwnerByGraphId(prev => {
                    const next = { ...prev } as Record<string, any>;
                    results.forEach(r => { next[r.id] = r.owner; });
                    return next;
                });
            } catch (e) {
                console.error('Failed to fetch graph owners', e);
            }
        };
        if (graphs && graphs.length) fetchOwners();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [graphs]);

    // Без поисковых полей: используем исходные списки graphs и users

    const { mutate: transferOwnership, isPending } = useMutation({
        mutationFn: () => AdminService.transferGraphOwnership(selectedGraphId, selectedUserId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['graphs'] });
            setSelectedGraphId('');
            setSelectedUserId('');
            notifySuccess('Права на граф успешно переданы');
        },
        onError: (error) => {
            console.error('Failed to transfer ownership:', error);
            notifyError('Ошибка при передаче прав на граф');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        transferOwnership();
    };

    const isFormValid = selectedGraphId && selectedUserId;

    if (isLoadingUsers) {
        return <SpinnerLoader />;
    }

    return (
        <AdminForm
            title="Передача прав на граф"
            onSubmit={handleSubmit}
            submitButtonText="Передать права"
            isSubmitting={isPending}
            isSubmitDisabled={!isFormValid}
        >
            <div className={styles.controls}>
                <div className={styles.picker}>
                    <div className={styles.pickerTitle}>Графы</div>
                    <div className={styles.list}>
                        {graphs.map((g) => {
                            const isActive = selectedGraphId === g._id;
                            const owner = ownerByGraphId[g._id];
                            return (
                                <button
                                    key={g._id}
                                    type="button"
                                    className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
                                    onClick={() => { setSelectedGraphId(g._id); setSelectedUserId(''); }}
                                >
                                    <div className={styles.avatar}>{g.name[0]?.toUpperCase() || '?'}</div>
                                    <div className={styles.info}>
                                        <div className={styles.name}>{g.name}</div>
                                        <div className={styles.secondary}>
                                            Владелец: {owner ? `${owner.firstName} ${owner.lastName} (@${owner.username})` : '—'}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                        {graphs.length === 0 && (
                            <div className={styles.emptyState}>Графы не найдены</div>
                        )}
                    </div>
                </div>

                <div className={styles.picker}>
                    <div className={styles.pickerTitle}>Пользователи</div>
                    <div className={styles.list}>
                        {users.map((u: IUser) => {
                            const isActive = selectedUserId === u._id;
                            const owned = u.managedGraphIds?.map(g => g.name) || [];
                            return (
                                <button
                                    key={u._id}
                                    type="button"
                                    className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
                                    onClick={() => setSelectedUserId(u._id)}
                                >
                                    <div className={styles.avatar}>{(u.firstName?.[0] || u.username?.[0] || '?').toUpperCase()}</div>
                                    <div className={styles.info}>
                                        <div className={styles.name}>{u.firstName} {u.lastName} (@{u.username})</div>
                                        <div className={styles.secondary}>{RoleTitles[u.role]}{owned.length ? ` • владелец: ${owned.join(', ')}` : ''}</div>
                                    </div>
                                </button>
                            );
                        })}
                        {selectedGraphId && users.length === 0 && (
                            <div className={styles.emptyState}>Пользователи не найдены</div>
                        )}
                        {!selectedGraphId && (
                            <div className={styles.emptyState}>Сначала выберите граф</div>
                        )}
                    </div>
                </div>
            </div>
        </AdminForm>
    );
}; 