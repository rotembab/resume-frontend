import { createContext } from 'react';
import { AlertColor } from '@mui/material';

export type SnackbarContextValue = {
  showSnackbar: (message: string, severity?: AlertColor) => void;
};

export const SnackbarContext = createContext<SnackbarContextValue | null>(null);
