import React, { FC, useEffect } from 'react'
import PopUpWrapper from '../PopUpWrapper/PopUpWrapper';
import { useMutation } from '@tanstack/react-query';
import { GraphService } from '@/services/graph.service';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';

interface InfoGraphPopUpProps {
    graphId: any;
    isInfoGraphPopupOpen: boolean;
    closeInfoGraphPopup: () => void;
}

const InfoGraphPopUp: FC<InfoGraphPopUpProps> = ({ 
    graphId, 
    isInfoGraphPopupOpen, 
    closeInfoGraphPopup 
}) => {

    // --- Информация --- 
    const { mutate, data, isPending } = useMutation({
        mutationFn: (graphId: string) => GraphService.getGraphById(graphId),
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

    console.log('data', data)

  return (
    <PopUpWrapper isOpen={isInfoGraphPopupOpen} onClose={closeInfoGraphPopup} width={1300} height={900}>
    <div>InfoGraphPopUp</div>
    </PopUpWrapper>
  )
}

export default InfoGraphPopUp
