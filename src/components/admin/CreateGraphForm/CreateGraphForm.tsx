import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminService } from '@/services/admin.service';
import { IGraphList } from '@/types/graph.interface';
import styles from './CreateGraphForm.module.scss';

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
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Пожалуйста, выберите файл изображения');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Размер файла не должен превышать 5MB');
                return;
            }

            setImage(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={styles.container}>
            <h2>Создание нового графа</h2>
            
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label htmlFor="graphName">Название графа:</label>
                    <input
                        id="graphName"
                        type="text"
                        value={graphName}
                        onChange={(e) => setGraphName(e.target.value)}
                        placeholder="Введите название графа"
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="parentGraph">Родительский граф:</label>
                    <select
                        id="parentGraph"
                        value={selectedParentGraph}
                        onChange={(e) => setSelectedParentGraph(e.target.value)}
                        required
                    >
                        <option value="">Выберите родительский граф</option>
                        {mainTopics.map(graph => (
                            <option key={graph._id} value={graph._id}>
                                {graph.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="image">Изображение графа:</label>
                    <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        required
                    />
                    {imagePreview && (
                        <div className={styles.imagePreview}>
                            <img src={imagePreview} alt="Preview" />
                        </div>
                    )}
                </div>

                <button 
                    type="submit" 
                    disabled={!graphName || !selectedParentGraph || !image || isPending}
                    className={styles.submitButton}
                >
                    {isPending ? 'Создание...' : 'Создать граф'}
                </button>
            </form>
        </div>
    );
}; 