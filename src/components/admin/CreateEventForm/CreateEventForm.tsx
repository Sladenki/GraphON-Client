import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EventService } from '@/services/event.service';
import { IGraphList } from '@/types/graph.interface';
import styles from './CreateEventForm.module.scss';

interface CreateEventFormProps {
    mainTopics: IGraphList[];
}

export const CreateEventForm = ({ mainTopics }: CreateEventFormProps) => {
    const [eventData, setEventData] = useState({
        name: '',
        description: '',
        eventDate: '',
        timeFrom: '',
        timeTo: '',
        graphId: ''
    });

    const queryClient = useQueryClient();

    const { mutate: createEvent, isPending } = useMutation({
        mutationFn: () => EventService.createEvent(eventData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['eventsList'] });
            setEventData({
                name: '',
                description: '',
                eventDate: '',
                timeFrom: '',
                timeTo: '',
                graphId: ''
            });
            alert('Мероприятие успешно создано');
        },
        onError: (error) => {
            console.error('Failed to create event:', error);
            alert('Ошибка при создании мероприятия');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventData.name || !eventData.description || !eventData.eventDate || 
            !eventData.timeFrom || !eventData.timeTo || !eventData.graphId) return;
        createEvent();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEventData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className={styles.container}>
            <h2>Создание нового мероприятия</h2>
            
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label htmlFor="name">Название мероприятия:</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={eventData.name}
                        onChange={handleChange}
                        placeholder="Введите название мероприятия"
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="description">Описание:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={eventData.description}
                        onChange={handleChange}
                        placeholder="Введите описание мероприятия"
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="graphId">Граф:</label>
                    <select
                        id="graphId"
                        name="graphId"
                        value={eventData.graphId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Выберите граф</option>
                        {mainTopics.map(graph => (
                            <option key={graph._id} value={graph._id}>
                                {graph.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.dateTimeGroup}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="eventDate">Дата:</label>
                        <input
                            id="eventDate"
                            name="eventDate"
                            type="date"
                            value={eventData.eventDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="timeFrom">Время начала:</label>
                        <input
                            id="timeFrom"
                            name="timeFrom"
                            type="time"
                            value={eventData.timeFrom}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="timeTo">Время окончания:</label>
                        <input
                            id="timeTo"
                            name="timeTo"
                            type="time"
                            value={eventData.timeTo}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={!eventData.name || !eventData.description || !eventData.eventDate || 
                             !eventData.timeFrom || !eventData.timeTo || !eventData.graphId || isPending}
                    className={styles.submitButton}
                >
                    {isPending ? 'Создание...' : 'Создать мероприятие'}
                </button>
            </form>
        </div>
    );
}; 