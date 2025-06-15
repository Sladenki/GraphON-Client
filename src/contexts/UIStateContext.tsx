import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UIState {
  isMobileNavOpen: boolean;
  isSubgraphPopUpOpen: boolean;
  isSchedulePopUpOpen: boolean;
  isInfoPopUpOpen: boolean;
}

interface UIStateContextType {
  uiState: UIState;
  setMobileNavOpen: (isOpen: boolean) => void;
  setSubgraphPopUpOpen: (isOpen: boolean) => void;
  setSchedulePopUpOpen: (isOpen: boolean) => void;
  setInfoPopUpOpen: (isOpen: boolean) => void;
  hasAnyModalOpen: boolean;
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

export const UIStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [uiState, setUIState] = useState<UIState>({
    isMobileNavOpen: false,
    isSubgraphPopUpOpen: false,
    isSchedulePopUpOpen: false,
    isInfoPopUpOpen: false,
  });

  const setMobileNavOpen = (isOpen: boolean) => {
    setUIState(prev => ({ ...prev, isMobileNavOpen: isOpen }));
  };

  const setSubgraphPopUpOpen = (isOpen: boolean) => {
    setUIState(prev => ({ ...prev, isSubgraphPopUpOpen: isOpen }));
  };

  const setSchedulePopUpOpen = (isOpen: boolean) => {
    setUIState(prev => ({ ...prev, isSchedulePopUpOpen: isOpen }));
  };

  const setInfoPopUpOpen = (isOpen: boolean) => {
    setUIState(prev => ({ ...prev, isInfoPopUpOpen: isOpen }));
  };

  const hasAnyModalOpen = uiState.isMobileNavOpen || 
                          uiState.isSubgraphPopUpOpen || 
                          uiState.isSchedulePopUpOpen || 
                          uiState.isInfoPopUpOpen;

  return (
    <UIStateContext.Provider value={{
      uiState,
      setMobileNavOpen,
      setSubgraphPopUpOpen,
      setSchedulePopUpOpen,
      setInfoPopUpOpen,
      hasAnyModalOpen
    }}>
      {children}
    </UIStateContext.Provider>
  );
};

export const useUIState = () => {
  const context = useContext(UIStateContext);
  if (context === undefined) {
    throw new Error('useUIState must be used within a UIStateProvider');
  }
  return context;
}; 