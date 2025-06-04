import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { ScheduleService, ICreateScheduleDto } from '@/services/schedule.service';
import { GraphService } from '@/services/graph.service';
import { IGraphList } from '@/types/graph.interface';
import { useState } from 'react';
import { ScheduleType } from '@/types/schedule.interface';
import { AdminForm, FormInputGroup, FormInput, FormSelect } from '@/components/ui/AdminForm';

interface CreateScheduleFormProps {
    globalGraphId: string;
}

const SCHEDULE_TYPES = [
    { value: ScheduleType.LECTURE, label: 'Лекция' },
    { value: ScheduleType.PRACTICE, label: 'Практика' },
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

export const CreateScheduleForm = ({ globalGraphId }: CreateScheduleFormProps) => {
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

    const { data: graphs = [], isLoading: isLoadingGraphs } = useQuery<IGraphList[]>({
        queryKey: ['graphs', globalGraphId],
        queryFn: async () => {
            const response = await GraphService.getAllChildrenByGlobal(globalGraphId);
            return response.data;
        }
    });

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
            isSubmitting={isPending || isLoadingGraphs}
            isSubmitDisabled={!isFormValid}
        >
            <FormInputGroup 
                label="Граф"
                description="Выберите граф, для которого создается расписание. Это может быть лекция или практика по данному графу."
            >
                <FormSelect
                    name="graphId"
                    value={formData.graphId}
                    onChange={handleChange}
                    options={[
                        { value: '', label: isLoadingGraphs ? 'Загрузка...' : 'Выберите граф' },
                        ...graphs.map((graph: IGraphList) => ({
                            value: graph._id,
                            label: graph.name
                        }))
                    ]}
                    required
                    disabled={isLoadingGraphs}
                />
            </FormInputGroup>

            <FormInputGroup 
                label="Название"
                description="Введите название занятия. Например: 'Лекция по основам графов' или 'Практика по алгоритмам'"
            >
                <FormInput
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Введите название"
                />
            </FormInputGroup>

            <FormInputGroup 
                label="Тип"
                description="Выберите тип занятия: лекция - теоретическое занятие, практика - практическое занятие с заданиями"
            >
                <FormSelect
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    options={SCHEDULE_TYPES}
                    required
                />
            </FormInputGroup>

            <FormInputGroup 
                label="Номер аудитории"
                description="Укажите номер аудитории, где будет проходить занятие"
            >
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

            <FormInputGroup 
                label="День недели"
                description="Выберите день недели, когда будет проходить занятие"
            >
                <FormSelect
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={handleChange}
                    options={DAYS_OF_WEEK.map((day, index) => ({
                        value: index.toString(),
                        label: day
                    }))}
                    required
                />
            </FormInputGroup>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <FormInputGroup 
                    label="Время начала"
                    description="Укажите время начала занятия в формате ЧЧ:ММ"
                >
                    <FormInput
                        type="time"
                        name="timeFrom"
                        value={formData.timeFrom}
                        onChange={handleChange}
                        required
                    />
                </FormInputGroup>

                <FormInputGroup 
                    label="Время окончания"
                    description="Укажите время окончания занятия в формате ЧЧ:ММ"
                >
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