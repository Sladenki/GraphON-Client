import { useState } from 'react';

export const useGraphPopup = () => {
  const [isGraphPopupOpen, setGraphPopupOpen] = useState(false);

  const handleGraphButtonClick = () => {
    setGraphPopupOpen(true);
  };

  const closeGraphPopup = () => {
    setGraphPopupOpen(false);
  };

  return {
    isGraphPopupOpen,
    handleGraphButtonClick,
    closeGraphPopup,
  };
};
