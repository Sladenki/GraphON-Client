import { ScheduleService } from '@/services/schedule.service';
import { useMutation } from '@tanstack/react-query';
import React, { FC } from 'react'
import ScheduleList from '../../ScheduleList/ScheduleList';
import { useScheduleByDays } from '@/hooks/useScheduleByDays';
import PopUpWrapper from '../../PopUpWrapper/PopUpWrapper';

const SchedulePopUp: FC<{graph: any, isSchedulePopupOpen: boolean, closeSchedulePopup: () => void}> = ({ graph, isSchedulePopupOpen, closeSchedulePopup }) => {

    // --- Расписание --- 
    const { mutate, data, isError, error } = useMutation({
        mutationFn: (graphId: string) => ScheduleService.getWeeklyScheduleByGraphId(graphId),
    });

    const handleButtonClick = () => {
        mutate(graph._id); // Передаём ID графа в мутацию
    };

    console.log('data', data)

    const scheduleByDays = useScheduleByDays(data?.data);

    return (
        <PopUpWrapper isOpen={isSchedulePopupOpen} onClose={closeSchedulePopup} >
            <div>SchedulePopUp</div>

            <button onClick={handleButtonClick}>
            Узнать расписание графа
            </button>

            {data && (
                <ScheduleList
                    scheduleByDays={scheduleByDays}
                    title="Расписание"
                />
            )}
        </PopUpWrapper>
    )
}

export default SchedulePopUp