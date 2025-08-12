import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { EventService } from '@/services/event.service';
import { GraphService } from '@/services/graph.service';
import { IGraphList } from '@/types/graph.interface';
import { AdminForm, FormInputGroup, FormInput, FormSelect, FormTextarea } from '@/components/ui/AdminForm';
import { notifyError, notifySuccess } from '@/lib/notifications';
import { useAuth } from '@/providers/AuthProvider';

interface CreateEventFormProps {
    globalGraphId?: string; // Делаем опциональным
}

export const CreateEventForm = ({ globalGraphId }: CreateEventFormProps) => {
    const DESCRIPTION_MAX_LENGTH = 300;
    const { user } = useAuth();
    
    // Используем selectedGraphId из пользователя, если globalGraphId не передан
    const selectedGraphId = globalGraphId || user?.selectedGraphId;
    
    const [eventData, setEventData] = useState({
        name: '',
        place: '',
        description: '',
        eventDate: '',
        timeFrom: '',
        timeTo: '',
        graphId: ''
    });

    const queryClient = useQueryClient();

    const { data: mainTopics = [], isLoading: isLoadingTopics } = useQuery<IGraphList[]>({
        queryKey: ['mainTopics', selectedGraphId],
        queryFn: async () => {
            if (!selectedGraphId) {
                throw new Error('Не выбран граф');
            }
            const response = await GraphService.getAllChildrenByGlobal(selectedGraphId);
            return response.data;
        },
        enabled: !!selectedGraphId // Запрос выполняется только если есть selectedGraphId
    });

    const { mutate: createEvent, isPending } = useMutation({
        mutationFn: () => {
            if (!selectedGraphId) {
                throw new Error('Не выбран граф');
            }
            return EventService.createEvent({
                ...eventData,
                globalGraphId: selectedGraphId
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['eventsList'] });
            setEventData({
                name: '',
                place: '',
                description: '',
                eventDate: '',
                timeFrom: '',
                timeTo: '',
                graphId: ''
            });
            notifySuccess('Мероприятие успешно создано!');
        },
        onError: (error: any) => {
            console.error('Failed to create event:', error);
            
            // Обработка ошибок валидации от сервера
            if (error?.response?.data?.message) {
                const messages = Array.isArray(error.response.data.message) 
                    ? error.response.data.message 
                    : [error.response.data.message];
                notifyError(messages.join('; '));
            } else {
                notifyError('Ошибка при создании мероприятия');
            }
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGraphId) {
            notifyError('Не выбран граф для создания мероприятия');
            return;
        }
        if (!eventData.name || !eventData.description || !eventData.place || !eventData.eventDate || 
            !eventData.timeFrom || !eventData.timeTo || !eventData.graphId) return;
        
        // Проверяем, что дата мероприятия не в прошлом
        const selectedDate = new Date(eventData.eventDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Убираем время, оставляем только дату
        
        if (selectedDate < today) {
            notifyError('Нельзя создать мероприятие на прошедшую дату');
            return;
        }
        
        // Если выбрана сегодняшняя дата, проверяем что время начала в будущем
        if (selectedDate.getTime() === today.getTime()) {
            const now = new Date();
            const [fromHours, fromMinutes] = eventData.timeFrom.split(':').map(Number);
            const eventStartTime = new Date();
            eventStartTime.setHours(fromHours, fromMinutes, 0, 0);
            
            if (eventStartTime <= now) {
                notifyError('Время начала мероприятия должно быть в будущем');
                return;
            }
        }
            
        // Validate that end time is after start time
        const [fromHours, fromMinutes] = eventData.timeFrom.split(':').map(Number);
        const [toHours, toMinutes] = eventData.timeTo.split(':').map(Number);
        const fromTime = fromHours * 60 + fromMinutes;
        const toTime = toHours * 60 + toMinutes;
        
        if (toTime <= fromTime) {
            alert('Время окончания должно быть позже времени начала');
            return;
        }
        
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
        eventData.description.length <= DESCRIPTION_MAX_LENGTH &&
        eventData.place &&
        eventData.eventDate && 
        eventData.timeFrom && 
        eventData.timeTo && 
        eventData.graphId;

    return (
        <>
        {!selectedGraphId ? (
            <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#6b7280',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
            }}>
                <p>Для создания мероприятия необходимо выбрать граф в настройках профиля</p>
            </div>
        ) : (
        <AdminForm
            title="Создание нового мероприятия"
            onSubmit={handleSubmit}
            submitButtonText="Создать мероприятие"
            isSubmitting={isPending || isLoadingTopics}
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
                label="Место проведения"
                description="Укажите место проведения мероприятия"
            >
                <FormInput
                    name="place"
                    type="text"
                    value={eventData.place}
                    onChange={handleChange}
                    placeholder="Введите место проведения мероприятия"
                    required
                />
            </FormInputGroup>

            <FormInputGroup 
                label="Описание"
                description={`Подробно опишите мероприятие. Укажите цель, программу, требования к участникам и другую важную информацию (максимум ${DESCRIPTION_MAX_LENGTH} символов)`}
            >
                <FormTextarea
                    name="description"
                    value={eventData.description}
                    onChange={handleChange}
                    placeholder="Введите описание мероприятия"
                    maxLength={DESCRIPTION_MAX_LENGTH}
                    required
                />
                <div style={{ 
                    fontSize: '12px', 
                    color: eventData.description.length > DESCRIPTION_MAX_LENGTH ? '#ef4444' : '#6b7280',
                    marginTop: '4px',
                    textAlign: 'right'
                }}>
                    {eventData.description.length}/{DESCRIPTION_MAX_LENGTH} символов
                </div>
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
                        { value: '', label: isLoadingTopics ? 'Загрузка...' : 'Выберите граф' },
                        ...mainTopics.map((graph: IGraphList) => ({
                            value: graph._id,
                            label: graph.name
                        }))
                    ]}
                    required
                    disabled={isLoadingTopics}
                />
            </FormInputGroup>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <FormInputGroup 
                    label="Дата:"
                >
                    <FormInput
                        name="eventDate"
                        type="date"
                        value={eventData.eventDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                    />
                </FormInputGroup>

                <FormInputGroup 
                    label="Время начала:"
                >
                    <FormInput
                        name="timeFrom"
                        type="time"
                        value={eventData.timeFrom}
                        onChange={handleChange}
                        min={eventData.eventDate === new Date().toISOString().split('T')[0] ? 
                            new Date().toTimeString().slice(0, 5) : undefined
                        }
                        required
                    />
                </FormInputGroup>

                <FormInputGroup 
                    label="Время окончания:"
                >
                    <FormInput
                        name="timeTo"
                        type="time"
                        value={eventData.timeTo}
                        onChange={handleChange}
                        min={eventData.timeFrom && eventData.timeFrom !== '' ? 
                            eventData.timeFrom : undefined
                        }
                        required
                    />
                </FormInputGroup>
            </div>
        </AdminForm>
        )}
        </>
    );
}; 