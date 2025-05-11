import { AdminService } from '@/services/admin.service';
import { UserService } from '@/services/user.service';
import { IUser } from '@/types/user.interface';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import styles from './TransferGraphOwnershipForm.module.scss';

interface TransferGraphOwnershipFormProps {
    graphs: Array<{ _id: string; name: string }>;
}

export const TransferGraphOwnershipForm = ({ graphs }: TransferGraphOwnershipFormProps) => {
    const [selectedGraphId, setSelectedGraphId] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const queryClient = useQueryClient();

    // Получение списка пользователей
    const { data: users, isLoading: isLoadingUsers } = useQuery({
        queryKey: ['users'],
        queryFn: () => UserService.getAllUsers(),
    });

    // Мутация для передачи прав
    const { mutate: transferOwnership, isPending } = useMutation({
        mutationFn: () => AdminService.transferGraphOwnership(selectedGraphId, selectedUserId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['graph/getParentGraphs'] });
            setSelectedGraphId('');
            setSelectedUserId('');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedGraphId && selectedUserId) {
            transferOwnership();
        }
    };

    if (isLoadingUsers) return <div>Загрузка пользователей...</div>;

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
                <label htmlFor="graph">Выберите граф:</label>
                <select
                    id="graph"
                    value={selectedGraphId}
                    onChange={(e) => setSelectedGraphId(e.target.value)}
                    required
                >
                    <option value="">Выберите граф</option>
                    {graphs.map((graph) => (
                        <option key={graph._id} value={graph._id}>
                            {graph.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="user">Выберите нового администратора:</label>
                <select
                    id="user"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    required
                >
                    <option value="">Выберите пользователя</option>
                    {users?.map((user: IUser) => (
                        <option key={user._id} value={user._id}>
                            {user.firstName} {user.lastName || ''} ({user.email})
                        </option>
                    ))}
                </select>
            </div>

            <button 
                type="submit" 
                disabled={isPending || !selectedGraphId || !selectedUserId}
                className={styles.submitButton}
            >
                {isPending ? 'Передача прав...' : 'Передать права'}
            </button>
        </form>
    );
}; 