import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminService } from '@/services/admin.service';
import { IGraphList } from '@/types/graph.interface';
import { AdminForm, FormInputGroup, FormInput, FormSelect, FormTextarea } from '@/components/ui/AdminForm';
import { GraphService } from '@/services/graph.service';
import { notifyError, notifySuccess } from '@/lib/notifications';


export const CreateGraphForm = () => {
    const [graphName, setGraphName] = useState('');
    const [selectedGlobalGraph, setSelectedGlobalGraph] = useState('');
    const [selectedParentGraph, setSelectedParentGraph] = useState('');
    const [directorName, setDirectorName] = useState('');
    const [directorVkLink, setDirectorVkLink] = useState('');
    const [vkLink, setVkLink] = useState('');
    const [about, setAbout] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const ABOUT_MAX_LENGTH = 200;

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
                globalGraphId: selectedGlobalGraph,
                directorName: directorName || undefined,
                directorVkLink: directorVkLink || undefined,
                vkLink: vkLink || undefined,
                about: about || undefined
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['graph/getParentGraphs'] });
            queryClient.invalidateQueries({ queryKey: ['graph/getTopicGraphs'] });
            setGraphName('');
            setSelectedGlobalGraph('');
            setSelectedParentGraph('');
            setDirectorName('');
            setDirectorVkLink('');
            setVkLink('');
            setAbout('');
            setImage(null);
            setImagePreview(null);
            notifySuccess('Граф успешно создан');
        },
        onError: (error: any) => {
            console.error('Failed to create graph:', error);
            
            // Обработка ошибок валидации от сервера
            if (error?.response?.data?.message) {
                const messages = Array.isArray(error.response.data.message) 
                    ? error.response.data.message 
                    : [error.response.data.message];
                notifyError(messages.join('; '));
            } else {
                notifyError('Ошибка при создании графа');
            }
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Проверка обязательных полей
        if (!graphName || !selectedGlobalGraph || !selectedParentGraph || !image) {
            console.log('Form validation failed:', {
                graphName: !graphName,
                selectedGlobalGraph: !selectedGlobalGraph,
                selectedParentGraph: !selectedParentGraph,
                image: !image
            });
            return;
        }

        // Проверка длины описания
        if (about.length > ABOUT_MAX_LENGTH) {
            notifyError(`Описание не может быть длиннее ${ABOUT_MAX_LENGTH} символов`);
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

    const handleGlobalGraphChange = (value: string) => {
        setSelectedGlobalGraph(value);
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
                    onChange={setSelectedParentGraph}
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

            <FormInputGroup label="Имя директора (необязательно):">
                <FormInput
                    type="text"
                    value={directorName}
                    onChange={(e) => setDirectorName(e.target.value)}
                    placeholder="Введите имя директора"
                />
            </FormInputGroup>

            <FormInputGroup label="Ссылка на VK директора (необязательно):">
                <FormInput
                    type="url"
                    value={directorVkLink}
                    onChange={(e) => setDirectorVkLink(e.target.value)}
                    placeholder="https://vk.com/username"
                />
            </FormInputGroup>

            <FormInputGroup label="Ссылка на VK графа (необязательно):">
                <FormInput
                    type="url"
                    value={vkLink}
                    onChange={(e) => setVkLink(e.target.value)}
                    placeholder="https://vk.com/group_name"
                />
            </FormInputGroup>

            <FormInputGroup label="Описание графа (необязательно):">
                <FormTextarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Введите описание графа"
                    rows={4}
                    maxLength={ABOUT_MAX_LENGTH}
                />
                <div style={{ 
                    fontSize: '12px', 
                    color: about.length > ABOUT_MAX_LENGTH ? '#e74c3c' : '#666',
                    marginTop: '4px',
                    textAlign: 'right'
                }}>
                    {about.length}/{ABOUT_MAX_LENGTH} символов
                </div>
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