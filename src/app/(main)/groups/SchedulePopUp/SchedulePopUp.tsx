import { ScheduleService } from '@/services/schedule.service';
import { useMutation } from '@tanstack/react-query';
import React, { FC, useEffect } from 'react'

import { SpinnerLoader } from '../../../../components/global/SpinnerLoader/SpinnerLoader';
import PopUpWrapper from '../../../../components/global/PopUpWrapper/PopUpWrapper';
import Calendar from '@/components/shared/Calendar/Calendar';


interface SchedulePopUpProps {
    graphId: any;
    isSchedulePopupOpen: boolean;
    closeSchedulePopup: () => void;
}


const SchedulePopUp: FC<SchedulePopUpProps> = ({ 
    graphId, 
    isSchedulePopupOpen, 
    closeSchedulePopup 
}) => {

    // --- Расписание --- 
    const { mutate, data, isPending } = useMutation({
        mutationFn: (graphId: string) => ScheduleService.getFullScheduleByGraphId(graphId),
    });

    useEffect(() => {
        // Вызовите мутацию сразу при монтировании компонента
        if (graphId) {
            mutate(graphId); 
        }
    }, [graphId, mutate]); // зависимость от graph и mutate, чтобы вызвать мутацию каждый раз, когда graph изменится


    if(isPending) {
        <SpinnerLoader/>
    }

    return (
        <PopUpWrapper 
      isOpen={isSchedulePopupOpen} 
      onClose={closeSchedulePopup} 
      width={1000} 
      height={900}
    >
            <div style={{
                overflowY: 'auto',
                overflowX: 'hidden',
                maxHeight: '100%',
                padding: '8px'
            }}>
                {data && (
                    <Calendar schedule={data?.data?.schedule} events={data?.data?.events} />
                )}
            </div>
        </PopUpWrapper>
    )
}

export default SchedulePopUp