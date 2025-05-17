import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ScheduleService, ICreateScheduleDto } from '@/services/schedule.service';
import { IGraphList } from '@/types/graph.interface';
import { useState } from 'react';
import { ScheduleType } from '@/types/schedule.interface';
import { AdminForm, FormInputGroup, FormInput, FormSelect } from '@/components/ui/AdminForm';

interface CreateScheduleFormProps {
    graphs: IGraphList[];
}

const SCHEDULE_TYPES = [
    { value: ScheduleType.LECTURE, label: 'Лекция' },
    { value: ScheduleType.PRACTICE, label: 'Практика' },
    { value: ScheduleType.LABORATORY, label: 'Лабораторная работа' }
];

const DAYS_OF_WEEK = [
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
    'Воскресенье'
];

export const CreateScheduleForm = ({ graphs }: CreateScheduleFormProps) => {
    const [formData, setFormData] = useState<ICreateScheduleDto>({
        graphId: '',
        name: '',
        type: ScheduleType.LECTURE,
        roomNumber: 0,
        dayOfWeek: 0,
        timeFrom: '',
        timeTo: ''
    });

    const queryClient = useQueryClient();

    const { mutate: createSchedule, isPending } = useMutation({
        mutationFn: () => ScheduleService.createSchedule(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
            setFormData({
                graphId: '',
                name: '',
                type: ScheduleType.LECTURE,
                roomNumber: 0,
                dayOfWeek: 0,
                timeFrom: '',
                timeTo: ''
            });
            alert('Расписание успешно создано');
        },
        onError: (error) => {
            console.error('Failed to create schedule:', error);
            alert('Ошибка при создании расписания');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createSchedule();
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
        <AdminForm
            title="Создать расписание"
            onSubmit={handleSubmit}
            submitButtonText="Создать расписание"
            isSubmitting={isPending}
            isSubmitDisabled={!isFormValid}
        >
            <FormInputGroup label="Граф">
                <FormSelect
                    name="graphId"
                    value={formData.graphId}
                    onChange={handleChange}
                    options={[
                        { value: '', label: 'Выберите граф' },
                        ...graphs.map(graph => ({
                            value: graph._id,
                            label: graph.name
                        }))
                    ]}
                    required
                />
            </FormInputGroup>

            <FormInputGroup label="Название">
                <FormInput
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Введите название"
                />
            </FormInputGroup>

            <FormInputGroup label="Тип">
                <FormSelect
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    options={SCHEDULE_TYPES}
                    required
                />
            </FormInputGroup>

            <FormInputGroup label="Номер аудитории">
                <FormInput
                    type="number"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="Введите номер аудитории"
                />
            </FormInputGroup>

            <FormInputGroup label="День недели">
                <FormSelect
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={handleChange}
                    options={DAYS_OF_WEEK.map((day, index) => ({
                        value: index,
                        label: day,
                        key: `day-${index}`
                    }))}
                    required
                />
            </FormInputGroup>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <FormInputGroup label="Время начала">
                    <FormInput
                        type="time"
                        name="timeFrom"
                        value={formData.timeFrom}
                        onChange={handleChange}
                        required
                    />
                </FormInputGroup>

                <FormInputGroup label="Время окончания">
                    <FormInput
                        type="time"
                        name="timeTo"
                        value={formData.timeTo}
                        onChange={handleChange}
                        required
                    />
                </FormInputGroup>
            </div>
        </AdminForm>
    );
}; 