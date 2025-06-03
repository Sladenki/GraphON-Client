import { AdminService } from '@/services/admin.service';
import { GraphService } from '@/services/graph.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { AdminForm, FormInputGroup, FormInput, FormSelect } from '@/components/ui/AdminForm';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { IGraphList } from '@/types/graph.interface';

export const CreateTopicGraphForm = () => {
    const [name, setName] = useState('');
    const [parentGraphId, setParentGraphId] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // Получение глобальных графов
    const { data: globalGraphs, isLoading, error } = useQuery<{ data: IGraphList[] }>({
        queryKey: ['graph/getGlobalGraphs'],
        queryFn: () => GraphService.getGlobalGraphs()
    });

    const { mutate: createTopicGraph, isPending } = useMutation({
        mutationFn: () => {
            return AdminService.createTopicGraph({ 
                name, 
                parentGraphId, 
                ...(image ? { image } : {})
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['graph/getParentGraphs'] });
            setName('');
            setParentGraphId('');
            setImage(null);
            setImagePreview(null);
            alert('Граф-тематика успешно создан');
        },
        onError: (error) => {
            console.error('Failed to create topic graph:', error);
            alert('Ошибка при создании графа-тематики');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !parentGraphId) {
            console.log('Form validation failed:', {
                name: !name.trim(),
                parentGraphId: !parentGraphId
            });
            return;
        }
        createTopicGraph();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImage(null);
            setImagePreview(null);
        }
    };

    const isFormValid = name.trim() && parentGraphId;

    if (isLoading) return <SpinnerLoader />;
    if (error) return <div>Ошибка при загрузке глобальных графов</div>;

    return (
        <AdminForm
            title="Создание графа-тематики"
            onSubmit={handleSubmit}
            submitButtonText="Создать граф-тематику"
            isSubmitting={isPending}
            isSubmitDisabled={!isFormValid}
        >
            <FormInputGroup label="Название графа:">
                <FormInput
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Введите название графа"
                    required
                />
            </FormInputGroup>

            <FormInputGroup label="Глобальный граф:">
                <FormSelect
                    value={parentGraphId}
                    onChange={(e) => setParentGraphId(e.target.value)}
                    options={[
                        { value: '', label: 'Выберите глобальный граф' },
                        ...(globalGraphs?.data || []).map(graph => ({
                            value: graph._id,
                            label: graph.name
                        }))
                    ]}
                    required
                />
            </FormInputGroup>

            <FormInputGroup label="Изображение графа (необязательно):">
                <FormInput
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                />
                {imagePreview && (
                    <div style={{ marginTop: '10px', maxWidth: '300px' }}>
                        <img 
                            src={imagePreview} 
                            alt="Preview" 
                            style={{ 
                                width: '100%', 
                                height: 'auto', 
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                            }} 
                        />
                    </div>
                )}
            </FormInputGroup>
        </AdminForm>
    );
}; 