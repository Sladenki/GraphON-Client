import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EventService } from '@/services/event.service';
import { IGraphList } from '@/types/graph.interface';
import { AdminForm, FormInputGroup, FormInput, FormSelect, FormTextarea } from '@/components/ui/AdminForm';

interface CreateEventFormProps {
    mainTopics: IGraphList[];
    globalGraphId: string;
}

export const CreateEventForm = ({ mainTopics, globalGraphId }: CreateEventFormProps) => {
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
        mutationFn: () => EventService.createEvent({
            ...eventData,
            globalGraphId
        }),
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

    const isFormValid = eventData.name && 
        eventData.description && 
        eventData.eventDate && 
        eventData.timeFrom && 
        eventData.timeTo && 
        eventData.graphId;

    return (
        <AdminForm
            title="Создание нового мероприятия"
            onSubmit={handleSubmit}
            submitButtonText="Создать мероприятие"
            isSubmitting={isPending}
            isSubmitDisabled={!isFormValid}
        >
            <FormInputGroup 
                label="Название мероприятия"
                description="Введите название мероприятия. Используйте понятное и информативное название, которое отражает суть события"
            >
                <FormInput
                    name="name"
                    type="text"
                    value={eventData.name}
                    onChange={handleChange}
                    placeholder="Введите название мероприятия"
                    required
                />
            </FormInputGroup>

            <FormInputGroup 
                label="Описание"
                description="Подробно опишите мероприятие. Укажите цель, программу, требования к участникам и другую важную информацию"
            >
                <FormTextarea
                    name="description"
                    value={eventData.description}
                    onChange={handleChange}
                    placeholder="Введите описание мероприятия"
                    required
                />
            </FormInputGroup>

            <FormInputGroup 
                label="Граф"
                description="Выберите граф, к которому относится мероприятие. Это поможет участникам найти связанные материалы и контент"
            >
                <FormSelect
                    name="graphId"
                    value={eventData.graphId}
                    onChange={handleChange}
                    options={[
                        { value: '', label: 'Выберите граф' },
                        ...mainTopics.map(graph => ({
                            value: graph._id,
                            label: graph.name
                        }))
                    ]}
                    required
                />
            </FormInputGroup>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <FormInputGroup label="Дата:">
                    <FormInput
                        name="eventDate"
                        type="date"
                        value={eventData.eventDate}
                        onChange={handleChange}
                        required
                    />
                </FormInputGroup>

                <FormInputGroup label="Время начала:">
                    <FormInput
                        name="timeFrom"
                        type="time"
                        value={eventData.timeFrom}
                        onChange={handleChange}
                        required
                    />
                </FormInputGroup>

                <FormInputGroup label="Время окончания:">
                    <FormInput
                        name="timeTo"
                        type="time"
                        value={eventData.timeTo}
                        onChange={handleChange}
                        required
                    />
                </FormInputGroup>
            </div>
        </AdminForm>
    );
}; 