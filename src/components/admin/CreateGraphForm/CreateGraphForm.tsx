import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminService } from '@/services/admin.service';
import { IGraphList } from '@/types/graph.interface';
import { AdminForm, FormInputGroup, FormInput, FormSelect } from '@/components/ui/AdminForm';

interface CreateGraphFormProps {
    mainTopics: IGraphList[];
}

export const CreateGraphForm = ({ mainTopics }: CreateGraphFormProps) => {
    const [graphName, setGraphName] = useState('');
    const [selectedParentGraph, setSelectedParentGraph] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const { mutate: createGraph, isPending } = useMutation({
        mutationFn: () => {
            if (!image) throw new Error('No image selected');
            
            return AdminService.createGraph({
                name: graphName,
                parentGraphId: selectedParentGraph,
                image: image
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['graph/getParentGraphs'] });
            setGraphName('');
            setSelectedParentGraph('');
            setImage(null);
            setImagePreview(null);
            alert('Граф успешно создан');
        },
        onError: (error) => {
            console.error('Failed to create graph:', error);
            alert('Ошибка при создании графа');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!graphName || !selectedParentGraph || !image) {
            console.log('Form validation failed:', {
                graphName: !graphName,
                selectedParentGraph: !selectedParentGraph,
                image: !image
            });
            return;
        }
        createGraph();
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

    const isFormValid = graphName && selectedParentGraph && image;

    return (
        <AdminForm
            title="Создание нового графа"
            onSubmit={handleSubmit}
            submitButtonText="Создать граф"
            isSubmitting={isPending}
            isSubmitDisabled={!isFormValid}
        >
            <FormInputGroup label="Название графа:">
                <FormInput
                    type="text"
                    value={graphName}
                    onChange={(e) => setGraphName(e.target.value)}
                    placeholder="Введите название графа"
                    required
                />
            </FormInputGroup>

            <FormInputGroup label="Родительский граф:">
                <FormSelect
                    value={selectedParentGraph}
                    onChange={(e) => setSelectedParentGraph(e.target.value)}
                    options={[
                        { value: '', label: 'Выберите родительский граф' },
                        ...mainTopics.map(graph => ({
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