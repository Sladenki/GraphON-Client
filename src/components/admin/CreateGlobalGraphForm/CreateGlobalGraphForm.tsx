import { AdminService } from '@/services/admin.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { AdminForm, FormInputGroup, FormInput } from '@/components/shared/AdminForm';

export const CreateGlobalGraphForm = () => {
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const { mutate: createGlobalGraph, isPending } = useMutation({
        mutationFn: () => {
            return AdminService.createGlobalGraph({ 
                name, 
                city, 
                ...(image ? { image } : {})
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['graph/getParentGraphs'] });
            setName('');
            setCity('');
            setImage(null);
            setImagePreview(null);
            alert('Глобальный граф успешно создан');
        },
        onError: (error) => {
            console.error('Failed to create global graph:', error);
            alert('Ошибка при создании глобального графа');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !city.trim()) {
            console.log('Form validation failed:', {
                name: !name.trim(),
                city: !city.trim()
            });
            return;
        }
        createGlobalGraph();
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

    const isFormValid = name.trim() && city.trim();

    return (
        <AdminForm
            title="Создание глобального графа"
            onSubmit={handleSubmit}
            submitButtonText="Создать глобальный граф"
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

            <FormInputGroup label="Город:">
                <FormInput
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Введите город"
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