import { createTheme } from '@mui/material/styles';
import { CustomColor, customColors } from './custom-colors';
import { CSSProperties } from 'react';

type CustomPaletteColor = {
  main: CSSProperties['color'];
  contrastText?: CSSProperties['color'];
  light?: CSSProperties['color'];
  dark?: CSSProperties['color'];
};

declare module '@mui/material/styles' {
  interface Palette extends Record<CustomColor, CustomPaletteColor> {}
  interface PaletteOptions
    extends Partial<Record<CustomColor, CustomPaletteColor>> {}
}
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides extends Record<CustomColor, true> {}
}

export const AppTheme = createTheme({
  palette: {
    mode: 'dark',
    ...customColors,

    primary: {
      main: '#ff0000', //red primary color
    },
    secondary: {
      main: '#ffffff',
    },

    background: {
      default: '#161312', //background color black
    },
  },

  typography: {
    fontFamily: "'Inter', sans-serif",

    h1: {
      fontWeight: 700,
      fontFamily: "'Poppins', sans-serif",
    },
    h3: {
      fontWeight: 500,
      fontFamily: "'Poppins', sans-serif",
    },
    button: {
      fontWeight: 700,
      fontFamily: "'Inter', sans-serif",
      textTransform: 'none',
    },
  },
});
