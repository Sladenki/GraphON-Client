import { AdminService } from '@/services/admin.service';
import { UserService } from '@/services/user.service';
import { IUser } from '@/types/user.interface';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AdminForm, FormInputGroup, FormSelect } from '@/components/ui/AdminForm';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { useSelectedGraphId as useSelectedGraphIdStore } from '@/stores/useUIStore';

interface TransferGraphOwnershipFormProps {
    graphs: Array<{ _id: string; name: string }>;
}

export const TransferGraphOwnershipForm = ({ graphs }: TransferGraphOwnershipFormProps) => {
    const selectedGraphIdFromStore = useSelectedGraphIdStore();
    const [selectedGraphId, setSelectedGraphId] = useState(selectedGraphIdFromStore ?? '');
    
    useEffect(() => {
        if (selectedGraphIdFromStore) {
            setSelectedGraphId(selectedGraphIdFromStore);
        }
    }, [selectedGraphIdFromStore]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const queryClient = useQueryClient();

    const {
        data,
        isLoading: isLoadingUsers
    } = useQuery({
        queryKey: ['usersByGraph', selectedGraphId],
        queryFn: () => UserService.getAllUsersByGraph(selectedGraphId),
        enabled: Boolean(selectedGraphId),
        refetchOnWindowFocus: false,
        refetchOnMount: false
    });

    const users = data || [];

    const { mutate: transferOwnership, isPending } = useMutation({
        mutationFn: () => AdminService.transferGraphOwnership(selectedGraphId, selectedUserId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['graphs'] });
            setSelectedGraphId('');
            setSelectedUserId('');
            alert('Права на граф успешно переданы');
        },
        onError: (error) => {
            console.error('Failed to transfer ownership:', error);
            alert('Ошибка при передаче прав на граф');
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
            <FormInputGroup label="Выберите граф:">
                <FormSelect
                    value={selectedGraphId}
                    onChange={(e) => setSelectedGraphId(e.target.value)}
                    options={[
                        { value: '', label: 'Выберите граф' },
                        ...graphs.map((graph) => ({
                            value: graph._id,
                            label: graph.name
                        }))
                    ]}
                    required
                />
            </FormInputGroup>

            <FormInputGroup label="Выберите нового администратора:">
                <FormSelect
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    options={[
                        { value: '', label: 'Выберите пользователя' },
                        ...users.map((user: IUser) => ({
                            value: user._id,
                            label: `${user.firstName} ${user.lastName || ''} (${user.username})`
                        }))
                    ]}
                    required
                />
            </FormInputGroup>
        </AdminForm>
    );
}; 