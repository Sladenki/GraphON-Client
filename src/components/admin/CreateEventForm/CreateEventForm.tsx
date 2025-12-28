import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { EventService } from '@/services/event.service';
import { GraphService } from '@/services/graph.service';
import { IGraphList } from '@/types/graph.interface';
import { AdminForm, FormInputGroup, FormInput, DropdownSelect, FormTextarea } from '@/components/shared/AdminForm';
import { notifyError, notifySuccess } from '@/lib/notifications';
import { useAuth } from '@/providers/AuthProvider';
import styles from './CreateEventForm.module.scss';

interface CreateEventFormProps {
    globalGraphId?: string; // Делаем опциональным
    hideGraphDropdown?: boolean; // Скрыть дропдаун выбора графа для обычных пользователей
    onSuccess?: () => void; // Callback после успешного создания
}

export const CreateEventForm = ({ globalGraphId, hideGraphDropdown = false, onSuccess }: CreateEventFormProps) => {
    const DESCRIPTION_MAX_LENGTH = 300;
    const { user } = useAuth();
    
    // Используем selectedGraphId из пользователя, если globalGraphId не передан
    const selectedGraphIdRaw: any = globalGraphId || user?.selectedGraphId;
    const selectedGraphId =
        selectedGraphIdRaw && typeof selectedGraphIdRaw === 'object'
            ? (selectedGraphIdRaw._id ?? selectedGraphIdRaw.$oid ?? '')
            : (selectedGraphIdRaw ?? '');
    
    // Минимально допустимая дата для создания мероприятия — завтрашний день (локальная дата)
    const formatDateYYYYMMDD = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const tomorrowDateLocal = new Date();
    tomorrowDateLocal.setHours(0, 0, 0, 0);
    tomorrowDateLocal.setDate(tomorrowDateLocal.getDate() + 1);
    const tomorrowISO = formatDateYYYYMMDD(tomorrowDateLocal);
    
    const [eventData, setEventData] = useState({
        name: '',
        place: '',
        description: '',
        eventDate: '',
        timeFrom: '',
        timeTo: '',
        graphId: '', // Для владельцев групп
        parentGraphId: '', // Для студентов (тематика)
        isDateTbd: false
    });

    const queryClient = useQueryClient();

    // Для обычных пользователей загружаем тематики (topic graphs), для редакторов - дочерние графы
    const { data: mainTopics = [], isLoading: isLoadingTopics } = useQuery<IGraphList[]>({
        queryKey: hideGraphDropdown ? ['topicGraphs', selectedGraphId] : ['mainTopics', selectedGraphId],
        queryFn: async () => {
            if (!selectedGraphId) {
                throw new Error('Не выбран граф');
            }
            if (hideGraphDropdown) {
                // Для студентов загружаем тематики
                const response = await GraphService.getGraphsByTopic(selectedGraphId);
                return response.data;
            } else {
                // Для редакторов загружаем дочерние графы
                const response = await GraphService.getAllChildrenByGlobal(selectedGraphId);
                return response.data;
            }
        },
        enabled: !!selectedGraphId // Запрос выполняется только если есть selectedGraphId
    });

        const { mutate: createEvent, isPending } = useMutation({
        mutationFn: () => {
            if (!selectedGraphId) {
                throw new Error('Не выбран граф');
            }
            
            // Для студентов используем parentGraphId, для редакторов - graphId
            const requestData: any = {
                name: eventData.name,
                globalGraphId: selectedGraphId,
                ...(eventData.description && { description: eventData.description }),
                ...(eventData.place && { place: eventData.place }),
            };

            if (hideGraphDropdown) {
                // Для студентов
                if (!eventData.parentGraphId) {
                    throw new Error('Выберите тематику');
                }
                requestData.parentGraphId = eventData.parentGraphId;
            } else {
                // Для редакторов
                if (!eventData.graphId) {
                    throw new Error('Выберите граф');
                }
                requestData.graphId = eventData.graphId;
            }

            // Обработка даты и времени
            if (eventData.isDateTbd) {
                requestData.isDateTbd = true;
            } else {
                if (!eventData.eventDate || !eventData.timeFrom) {
                    throw new Error('Укажите дату и время или отметьте "Дата уточняется"');
                }
                // Преобразуем дату в ISO формат
                const dateTime = new Date(`${eventData.eventDate}T${eventData.timeFrom}:00`);
                requestData.eventDate = dateTime.toISOString();
                requestData.timeFrom = eventData.timeFrom;
                if (eventData.timeTo) {
                    requestData.timeTo = eventData.timeTo;
                }
            }

            return EventService.createEvent(requestData);
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
                graphId: '',
                parentGraphId: '',
                isDateTbd: false
            });
            notifySuccess('Мероприятие успешно создано!');
            onSuccess?.(); // Вызываем callback если передан
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
        
        // Валидация для студентов
        if (hideGraphDropdown) {
            if (!eventData.parentGraphId) {
                notifyError('Выберите тематику');
                return;
            }
        } else {
            // Валидация для редакторов
            if (!eventData.graphId) {
                notifyError('Выберите граф');
                return;
            }
        }

        if (!eventData.name) {
            notifyError('Введите название мероприятия');
            return;
        }
        
        // Если дата уточняется, то время не обязательно
        // timeTo опционально согласно документации
        if (!eventData.isDateTbd && !eventData.timeFrom) return;
        
        // Проверяем, что дата мероприятия не сегодня и не в прошлом (строго с завтрашнего дня)
        // Только если дата не уточняется
        if (!eventData.isDateTbd && eventData.eventDate < tomorrowISO) {
            notifyError('Мероприятие можно создать только на следующий день');
            return;
        }
            
        // Validate that end time is after start time (только если дата не уточняется и timeTo указано)
        if (!eventData.isDateTbd && eventData.timeFrom && eventData.timeTo) {
            const [fromHours, fromMinutes] = eventData.timeFrom.split(':').map(Number);
            const [toHours, toMinutes] = eventData.timeTo.split(':').map(Number);
            const fromTime = fromHours * 60 + fromMinutes;
            const toTime = toHours * 60 + toMinutes;
            
            if (toTime <= fromTime) {
                notifyError('Время окончания должно быть позже времени начала');
                return;
            }
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
        (!eventData.description || eventData.description.length <= DESCRIPTION_MAX_LENGTH) &&
        // Для студентов требуется parentGraphId, для редакторов - graphId
        (hideGraphDropdown ? eventData.parentGraphId : eventData.graphId) &&
        // Если дата уточняется, то eventDate и время не обязательны
        (eventData.isDateTbd || (eventData.eventDate && eventData.timeFrom));

    return (
        <>
        {!selectedGraphId ? (
            <div className={styles.notice}>
                <p>Для создания мероприятия необходимо выбрать граф в настройках профиля</p>
            </div>
        ) : (
        <AdminForm
            onSubmit={handleSubmit}
            submitButtonText="Создать мероприятие"
            isSubmitting={isPending || isLoadingTopics}
            isSubmitDisabled={!isFormValid}
        >
            <FormInputGroup 
                label="1. Название мероприятия"
            >
                <FormInput
                    name="name"
                    type="text"
                    value={eventData.name}
                    onChange={handleChange}
                    required
                />
            </FormInputGroup>

            <FormInputGroup 
                label="2. Место проведения"
            >
                <FormInput
                    name="place"
                    type="text"
                    value={eventData.place}
                    onChange={handleChange}
                />
            </FormInputGroup>

            <FormInputGroup 
                label="3. Описание"
            >
                <FormTextarea
                    name="description"
                    value={eventData.description}
                    onChange={handleChange}
                    maxLength={DESCRIPTION_MAX_LENGTH}
                />
                <div className={`${styles.counter} ${eventData.description.length > DESCRIPTION_MAX_LENGTH ? styles.counterError : ''}`}>
                    {eventData.description.length}/{DESCRIPTION_MAX_LENGTH} символов
                </div>
            </FormInputGroup>

            {hideGraphDropdown ? (
                <FormInputGroup 
                    label="4. Тематика"
                    description="Выберите тематику, к которой относится мероприятие"
                >
                    <DropdownSelect
                        name="parentGraphId"
                        value={eventData.parentGraphId}
                        onChange={(value) => setEventData(prev => ({ ...prev, parentGraphId: Array.isArray(value) ? (value[0] ?? '') : value }))}
                        placeholder={isLoadingTopics ? 'Загрузка...' : 'Выберите тематику'}
                        options={mainTopics.map((graph: IGraphList) => ({
                            value: graph._id,
                            label: graph.name
                        }))}
                        required
                        disabled={isLoadingTopics}
                    />
                </FormInputGroup>
            ) : (
                <FormInputGroup 
                    label="4. Граф"
                    description="Выберите граф, к которому относится мероприятие"
                >
                    <DropdownSelect
                        name="graphId"
                        value={eventData.graphId}
                        onChange={(value) => setEventData(prev => ({ ...prev, graphId: Array.isArray(value) ? (value[0] ?? '') : value }))}
                        placeholder={isLoadingTopics ? 'Загрузка...' : 'Выберите граф'}
                        options={mainTopics.map((graph: IGraphList) => ({
                            value: graph._id,
                            label: graph.name
                        }))}
                        required
                        disabled={isLoadingTopics}
                    />
                </FormInputGroup>
            )}

            <FormInputGroup 
                label={hideGraphDropdown ? "4. Дата и время" : "5. Дата и время"}
                description="Вы можете уточнить дату и время мероприятия позже при редактировании"
            >
                <label className={styles.checkboxRow}>
                    <input
                        type="checkbox"
                        id="isDateTbd"
                        name="isDateTbd"
                        checked={eventData.isDateTbd}
                        onChange={(e) => setEventData(prev => ({
                            ...prev,
                            isDateTbd: e.target.checked
                        }))}
                    />
                    <span className={styles.checkboxLabel}>
                        Дата и время уточняется
                    </span>
                </label>
            </FormInputGroup>

            {!eventData.isDateTbd && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <FormInputGroup 
                        label="Дата:"
                    >
                        <FormInput
                            name="eventDate"
                            type="date"
                            value={eventData.eventDate}
                            onChange={handleChange}
                            min={tomorrowISO}
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
                            required
                        />
                    </FormInputGroup>

                    <FormInputGroup 
                        label="Время окончания (опционально):"
                    >
                        <FormInput
                            name="timeTo"
                            type="time"
                            value={eventData.timeTo}
                            onChange={handleChange}
                            min={eventData.timeFrom && eventData.timeFrom !== '' ? 
                                eventData.timeFrom : undefined
                            }
                        />
                    </FormInputGroup>
                </div>
            )}
        </AdminForm>
        )}
        </>
    );
}; 