import { AdminService } from '@/services/admin.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { AdminForm, FormInputGroup, FormInput, FormSelect } from '@/components/ui/AdminForm';

interface CreateTopicGraphFormProps {
    globalGraphs: Array<{ _id: string; name: string }>;
}

export const CreateTopicGraphForm: React.FC<CreateTopicGraphFormProps> = ({ globalGraphs }) => {
    const [name, setName] = useState('');
    const [parentGraphId, setParentGraphId] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const { mutate: createTopicGraph, isPending } = useMutation({
        mutationFn: () => {
            if (!image) throw new Error('Изображение обязательно');
            return AdminService.createTopicGraph({ name, parentGraphId, image });
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
        if (!name.trim() || !parentGraphId || !image) {
            console.log('Form validation failed:', {
                name: !name.trim(),
                parentGraphId: !parentGraphId,
                image: !image
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
        }
    };

    const isFormValid = name.trim() && parentGraphId && image;

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
                        ...globalGraphs.map(graph => ({
                            value: graph._id,
                            label: graph.name
                        }))
                    ]}
                    required
                />
            </FormInputGroup>

            <FormInputGroup label="Изображение графа:">
                <FormInput
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
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