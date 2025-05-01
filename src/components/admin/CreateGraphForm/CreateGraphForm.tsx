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
    const queryClient = useQueryClient();

    const { mutate: createGraph, isPending } = useMutation({
        mutationFn: () => AdminService.createGraph({
            name: graphName,
            parentGraphId: selectedParentGraph
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['graph/getParentGraphs'] });
            setGraphName('');
            setSelectedParentGraph('');
            alert('Граф успешно создан');
        },
        onError: (error) => {
            console.error('Failed to create graph:', error);
            alert('Ошибка при создании графа');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!graphName || !selectedParentGraph) return;
        createGraph();
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

                <button 
                    type="submit" 
                    disabled={!graphName || !selectedParentGraph || isPending}
                    className={styles.submitButton}
                >
                    {isPending ? 'Создание...' : 'Создать граф'}
                </button>
            </form>
        </div>
    );
}; 