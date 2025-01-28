import { ScheduleService } from '@/services/schedule.service';
import { useMutation } from '@tanstack/react-query';
import React, { FC, useEffect } from 'react'
import ScheduleList from '../../ScheduleList/ScheduleList';
import { useScheduleByDays } from '@/hooks/useScheduleByDays';
import PopUpWrapper from '../../PopUpWrapper/PopUpWrapper';

const SchedulePopUp: FC<{graph: any, isSchedulePopupOpen: boolean, closeSchedulePopup: () => void}> = ({ graph, isSchedulePopupOpen, closeSchedulePopup }) => {

    // --- Расписание --- 
    const { mutate, data, isError, error } = useMutation({
        mutationFn: (graphId: string) => ScheduleService.getWeeklyScheduleByGraphId(graphId),
    });

    useEffect(() => {
        // Вызовите мутацию сразу при монтировании компонента
        if (graph?._id) {
            mutate(graph._id); 
        }
    }, [graph, mutate]); // зависимость от graph и mutate, чтобы вызвать мутацию каждый раз, когда graph изменится

    const scheduleByDays = useScheduleByDays(data?.data);

    return (
        <PopUpWrapper isOpen={isSchedulePopupOpen} onClose={closeSchedulePopup} width={800}>
            {/* <div>SchedulePopUp</div> */}

            {data && (
                <ScheduleList
                    scheduleByDays={scheduleByDays}
                    title={`Расписание графа - ${graph.name}`}
                />
            )}
        </PopUpWrapper>
    )
}

export default SchedulePopUp