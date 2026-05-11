import { ReactNode, useCallback, useMemo, useState } from 'react';
import { Alert, AlertColor, Snackbar } from '@mui/material';
import { SnackbarContext, SnackbarContextValue } from './snackbar-context';

type SnackbarState = {
  open: boolean;
  message: string;
  severity: AlertColor;
};

const INITIAL_STATE: SnackbarState = {
  open: false,
  message: '',
  severity: 'success',
};

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SnackbarState>(INITIAL_STATE);

  const showSnackbar = useCallback<SnackbarContextValue['showSnackbar']>(
    (message, severity = 'success') => {
      setState({ open: true, message, severity });
    },
    []
  );

  const handleClose = () => setState((prev) => ({ ...prev, open: false }));

  const value = useMemo(() => ({ showSnackbar }), [showSnackbar]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleClose}
          severity={state.severity}
          variant='filled'
          sx={{ width: '100%' }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
