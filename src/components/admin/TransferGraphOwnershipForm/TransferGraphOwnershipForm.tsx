import { AdminService } from '@/services/admin.service';
import { UserService } from '@/services/user.service';
import { IUser } from '@/types/user.interface';
import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useRef, useEffect } from 'react';
import { AdminForm, FormInputGroup, FormSelect } from '@/components/ui/AdminForm';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';

interface TransferGraphOwnershipFormProps {
    graphs: Array<{ _id: string; name: string }>;
}

export const TransferGraphOwnershipForm = ({ graphs }: TransferGraphOwnershipFormProps) => {
    const [selectedGraphId, setSelectedGraphId] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const queryClient = useQueryClient();
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const {
        data,
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

            {hasNextPage && (
                <div ref={loadMoreRef} style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                    {isFetchingNextPage ? <SpinnerLoader /> : null}
                </div>
            )}
        </AdminForm>
    );
}; 