import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ScheduleService, ICreateScheduleDto } from '@/services/schedule.service';
import { IGraphList } from '@/types/graph.interface';
import { useState } from 'react';
import styles from './CreateScheduleForm.module.scss';
import { ScheduleType } from '@/types/schedule.interface';

interface CreateScheduleFormProps {
    graphs: IGraphList[];
}

const DAYS_OF_WEEK = [
    'Воскресенье',
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота'
];

const SCHEDULE_TYPES = [
    { value: ScheduleType.LECTURE, label: 'Лекция' },
    { value: ScheduleType.PRACTICE, label: 'Практика' }
];

export const CreateScheduleForm = ({ graphs }: CreateScheduleFormProps) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<ICreateScheduleDto>({
        graphId: '',
        name: '',
        type: ScheduleType.LECTURE,
        roomNumber: 0,
        dayOfWeek: 1,
        timeFrom: '',
        timeTo: ''
    });

    const { mutate: createSchedule, isPending } = useMutation({
        mutationFn: (data: ICreateScheduleDto) => ScheduleService.createSchedule(data),
        onSuccess: () => {
            alert('Расписание успешно создано');
            setFormData({
                graphId: '',
                name: '',
                type: ScheduleType.LECTURE,
                roomNumber: 0,
                dayOfWeek: 1,
                timeFrom: '',
                timeTo: ''
            });
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
        },
        onError: (error) => {
            alert('Ошибка при создании расписания');
            console.error('Error creating schedule:', error);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createSchedule(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'roomNumber' ? parseInt(value) || 0 : value
        }));
    };

    const isFormValid = formData.graphId && 
        formData.name && 
        formData.type && 
        formData.roomNumber > 0 && 
        formData.timeFrom && 
        formData.timeTo;

    return (
        <div className={styles.container}>
            <h2>Создать расписание</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label htmlFor="graphId">Граф</label>
                    <select
                        id="graphId"
                        name="graphId"
                        value={formData.graphId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Выберите граф</option>
                        {graphs.map(graph => (
                            <option key={graph._id} value={graph._id}>
                                {graph.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="name">Название</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Введите название"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="type">Тип</label>
                    <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                    >
                        {SCHEDULE_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="roomNumber">Номер аудитории</label>
                    <input
                        type="number"
                        id="roomNumber"
                        name="roomNumber"
                        value={formData.roomNumber}
                        onChange={handleChange}
                        required
                        min="0"
                        placeholder="Введите номер аудитории"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="dayOfWeek">День недели</label>
                    <select
                        id="dayOfWeek"
                        name="dayOfWeek"
                        value={formData.dayOfWeek}
                        onChange={handleChange}
                        required
                    >
                        {DAYS_OF_WEEK.map((day, index) => (
                            <option key={index} value={index}>
                                {day}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.timeGroup}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="timeFrom">Время начала</label>
                        <input
                            type="time"
                            id="timeFrom"
                            name="timeFrom"
                            value={formData.timeFrom}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="timeTo">Время окончания</label>
                        <input
                            type="time"
                            id="timeTo"
                            name="timeTo"
                            value={formData.timeTo}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={!isFormValid || isPending}
                    className={styles.submitButton}
                >
                    {isPending ? 'Создание...' : 'Создать расписание'}
                </button>
            </form>
        </div>
    );
}; 