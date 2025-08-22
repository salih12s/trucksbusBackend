import React, { createContext, useCallback, useContext, useState } from 'react';
import { ConfirmDialog, type ConfirmOptions } from '../components/common/ConfirmDialog';

type Resolver = (value: boolean) => void;

interface ConfirmState extends ConfirmOptions {
  open: boolean;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export const ConfirmDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ConfirmState>({ 
    open: false, 
    title: '',
    severity: 'info'
  });
  const [resolver, setResolver] = useState<Resolver | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
      setState({ 
        open: true, 
        severity: 'info',
        ...options 
      });
    });
  }, []);

  const handleClose = (confirmed: boolean) => {
    setState(prev => ({ ...prev, open: false }));
    if (resolver) {
      resolver(confirmed);
      setResolver(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog 
        open={state.open} 
        onClose={handleClose} 
        title={state.title}
        description={state.description}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        severity={state.severity}
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirmDialog = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirmDialog must be used within ConfirmDialogProvider');
  }
  return context;
};
