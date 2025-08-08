import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminService } from '@/services/admin.service';
import { IGraphList } from '@/types/graph.interface';
import { AdminForm, FormInputGroup, FormInput, FormSelect } from '@/components/ui/AdminForm';
import { GraphService } from '@/services/graph.service';


export const CreateGraphForm = () => {
    const [graphName, setGraphName] = useState('');
    const [selectedGlobalGraph, setSelectedGlobalGraph] = useState('');
    const [selectedParentGraph, setSelectedParentGraph] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // Получение глобальных графов
    const { data: globalGraphs, isLoading: isLoadingGlobalGraphs } = useQuery({
        queryKey: ['graph/getGlobalGraphs'],
        queryFn: async () => {
            const response = await GraphService.getGlobalGraphs();
            return response.data as IGraphList[];
        },
    });

    // Получение родительских графов (графов-тематик) после выбора глобального графа
    const { data: parentGraphs, isLoading: isLoadingParentGraphs } = useQuery({
        queryKey: ['graph/getTopicGraphs', selectedGlobalGraph],
        queryFn: async () => {
            if (!selectedGlobalGraph) return [];
            const response = await GraphService.getGraphsByTopic(selectedGlobalGraph);
            return response.data as IGraphList[];
        },
        enabled: !!selectedGlobalGraph, // Запрос выполняется только если выбран глобальный граф
    });

    const { mutate: createGraph, isPending } = useMutation({
        mutationFn: () => {
            if (!image) throw new Error('No image selected');
            
            return AdminService.createGraph({
                name: graphName,
                parentGraphId: selectedParentGraph,
                image: image,
                globalGraphId: selectedGlobalGraph
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['graph/getParentGraphs'] });
            queryClient.invalidateQueries({ queryKey: ['graph/getTopicGraphs'] });
            setGraphName('');
            setSelectedGlobalGraph('');
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
        if (!graphName || !selectedGlobalGraph || !selectedParentGraph || !image) {
            console.log('Form validation failed:', {
                graphName: !graphName,
                selectedGlobalGraph: !selectedGlobalGraph,
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

    const handleGlobalGraphChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newGlobalGraphId = e.target.value;
        setSelectedGlobalGraph(newGlobalGraphId);
        // Сбрасываем выбор родительского графа при смене глобального графа
        setSelectedParentGraph('');
    };

    const isFormValid = graphName && selectedGlobalGraph && selectedParentGraph && image;

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

            <FormInputGroup label="Глобальный граф:">
                <FormSelect
                    value={selectedGlobalGraph}
                    onChange={handleGlobalGraphChange}
                    options={[
                        { value: '', label: 'Выберите глобальный граф' },
                        ...(globalGraphs?.map((graph: IGraphList) => ({
                            value: graph._id,
                            label: graph.name
                        })) || [])
                    ]}
                    required
                    disabled={isLoadingGlobalGraphs}
                />
            </FormInputGroup>

            <FormInputGroup label="Родительский граф (граф-тематика):">
                <FormSelect
                    value={selectedParentGraph}
                    onChange={(e) => setSelectedParentGraph(e.target.value)}
                    options={[
                        { value: '', label: selectedGlobalGraph ? 'Выберите родительский граф' : 'Сначала выберите глобальный граф' },
                        ...(parentGraphs?.map((graph: IGraphList) => ({
                            value: graph._id,
                            label: graph.name
                        })) || [])
                    ]}
                    required
                    disabled={!selectedGlobalGraph || isLoadingParentGraphs}
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