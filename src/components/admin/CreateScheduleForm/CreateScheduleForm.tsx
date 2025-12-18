import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { ScheduleService, ICreateScheduleDto } from '@/services/schedule.service';
import { GraphService } from '@/services/graph.service';
import { IGraphList } from '@/types/graph.interface';
import { useState } from 'react';
import { ScheduleType } from '@/types/schedule.interface';
import { AdminForm, FormInputGroup, FormInput, DropdownSelect } from '@/components/shared/AdminForm';

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
    // Нормализуем возможный объектный идентификатор в строку
    const rawGlobalId: any = globalGraphId as any;
    const normalizedGlobalId: string =
        rawGlobalId && typeof rawGlobalId === 'object'
            ? (rawGlobalId._id ?? rawGlobalId.$oid ?? '')
            : (rawGlobalId ?? '');

    const [formData, setFormData] = useState<ICreateScheduleDto>({
        graphId: '',
        name: '',
        type: ScheduleType.LECTURE,
        roomNumber: '',
        dayOfWeek: 0,
        timeFrom: '',
        timeTo: ''
    });

    const queryClient = useQueryClient();

    const { data: graphs = [], isLoading: isLoadingGraphs } = useQuery<IGraphList[]>({
        queryKey: ['graphs', normalizedGlobalId],
        queryFn: async () => {
            const response = await GraphService.getAllChildrenByGlobal(normalizedGlobalId);
            return response.data;
        },
        enabled: !!normalizedGlobalId
    });

    const { mutate: createSchedule, isPending } = useMutation({
        mutationFn: () => {
            return ScheduleService.createSchedule(formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
            setFormData({
                graphId: '',
                name: '',
                type: ScheduleType.LECTURE,
                roomNumber: '',
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
            [name]: value
        }));
    };

    const isFormValid = !!formData.graphId && 
        !!formData.name && 
        !!formData.type && 
        !!formData.roomNumber &&
        !!formData.timeFrom && 
        !!formData.timeTo;

    return (
        <AdminForm
            title="Создать расписание"
            onSubmit={handleSubmit}
            submitButtonText="Создать расписание"
            isSubmitting={isPending || isLoadingGraphs}
            isSubmitDisabled={!isFormValid}
        >
            <FormInputGroup 
                label="1.Граф"
                description="Выберите граф, для которого создается расписание."
            >
                <DropdownSelect
                    name="graphId"
                    value={formData.graphId}
                    onChange={(value) => setFormData(prev => ({ ...prev, graphId: Array.isArray(value) ? (value[0] ?? '') : value }))}
                    placeholder={isLoadingGraphs ? 'Загрузка...' : 'Выберите граф'}
                    options={graphs.map((graph: IGraphList) => ({
                        value: graph._id,
                        label: graph.name
                    }))}
                    required
                    disabled={isLoadingGraphs}
                />
            </FormInputGroup>

            <FormInputGroup 
                label="2. Название"
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
                label="3. Тип"
            >
                <DropdownSelect
                    name="type"
                    value={formData.type}
                    onChange={(value) => setFormData(prev => ({ ...prev, type: value as ScheduleType }))}
                    options={SCHEDULE_TYPES}
                    required
                />
            </FormInputGroup>

            <FormInputGroup 
                label="4. Номер аудитории"
            >
                <FormInput
                    type="string"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    required
                    placeholder="Введите номер аудитории"
                />
            </FormInputGroup>

            <FormInputGroup 
                label="5. День недели"
            >
                <DropdownSelect
                  name="dayOfWeek"
                  value={Array.isArray(formData.dayOfWeek) ? formData.dayOfWeek.map((n) => n.toString()) : formData.dayOfWeek.toString()}
                  onChange={(value) => {
                    const arr = Array.isArray(value) ? value : [value];
                    const nums = arr.map(v => parseInt(v)).filter(v => !Number.isNaN(v));
                    setFormData(prev => ({
                      ...prev,
                      dayOfWeek: (nums.length > 1 ? (nums as any) : (nums[0] ?? 0)) as any,
                    }));
                  }}
                  options={DAYS_OF_WEEK.map((day, index) => ({
                    value: index.toString(),
                    label: day
                  }))}
                  selectionMode="multiple"
                  required
                />
            </FormInputGroup>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <FormInputGroup 
                    label="Время начала"
                    description="В формате ЧЧ:ММ"
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
                    description="В формате ЧЧ:ММ"
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