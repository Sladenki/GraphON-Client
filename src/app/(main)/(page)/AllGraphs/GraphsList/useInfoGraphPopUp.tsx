import { useState } from 'react';

export const useInfoGraphPopup = () => {
  const [isInfoGraphPopupOpen, setInfoGraphPopupOpen] = useState(false);

  const handleInfoGraphButtonClick = () => {
    setInfoGraphPopupOpen(true);
  };

  const closeInfoGraphPopup = () => {
    setInfoGraphPopupOpen(false);
  };

  return {
    isInfoGraphPopupOpen,
    handleInfoGraphButtonClick,
    closeInfoGraphPopup,
  };
};