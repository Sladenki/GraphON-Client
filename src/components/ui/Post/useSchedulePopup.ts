import { useState } from 'react';

export const useSchedulePopup = () => {
  const [isSchedulePopupOpen, setSchedulePopupOpen] = useState(false);

  const handleScheduleButtonClick = () => {
    setSchedulePopupOpen(true);
  };

  const closeSchedulePopup = () => {
    setSchedulePopupOpen(false);
  };

  return {
    isSchedulePopupOpen,
    handleScheduleButtonClick,
    closeSchedulePopup,
  };
};
