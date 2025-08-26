import React, { createContext, useCallback, useContext, useState } from 'react';
import { PromptDialog, type PromptOptions } from '../components/common/PromptDialog';

type PromptResolver = (value: string | null) => void;

interface PromptState extends PromptOptions {
  open: boolean;
}

interface PromptContextType {
  prompt: (options: PromptOptions) => Promise<string | null>;
}

const PromptContext = createContext<PromptContextType | null>(null);

export const PromptDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PromptState>({ 
    open: false, 
    title: ''
  });
  const [resolver, setResolver] = useState<PromptResolver | null>(null);

  const prompt = useCallback((options: PromptOptions) => {
    return new Promise<string | null>((resolve) => {
      setResolver(() => resolve);
      setState({ 
        open: true, 
        ...options 
      });
    });
  }, []);

  const handleClose = (result: string | null) => {
    setState(prev => ({ ...prev, open: false }));
    if (resolver) {
      resolver(result);
      setResolver(null);
    }
  };

  return (
    <PromptContext.Provider value={{ prompt }}>
      {children}
      <PromptDialog 
        open={state.open} 
        onClose={handleClose} 
        title={state.title}
        label={state.label}
        placeholder={state.placeholder}
        defaultValue={state.defaultValue}
        multiline={state.multiline}
        rows={state.rows}
      />
    </PromptContext.Provider>
  );
};

export const usePromptDialog = () => {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error('usePromptDialog must be used within PromptDialogProvider');
  }
  return context;
};
