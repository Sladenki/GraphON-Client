import { useState } from 'react';

export const useGraphInfoPopup = () => {
  const [isGraphInfoPopupOpen, setGraphInfoPopupOpen] = useState(false);

  const handleGraphInfoButtonClick = () => {
    setGraphInfoPopupOpen(true);
  };

  const closeGraphInfoPopup = () => {
    setGraphInfoPopupOpen(false);
  };

  return {
    isGraphInfoPopupOpen,
    handleGraphInfoButtonClick,
    closeGraphInfoPopup,
  };
};