import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    customColors: {
      darkest: string;
      heading: string;
      paragraph: string;
    };
  }
  interface PaletteOptions {
    customColors?: {
      darkest?: string;
      heading?: string;
      paragraph?: string;
    };
  }
}
export const AppTheme = createTheme({
  palette: {
    mode: 'dark',

    customColors: {
      darkest: '#1C1A19',
      heading: '#353334',
      paragraph: '#998e8f',
    },

    primary: {
      main: '#ff0000', //red primary color
    },

    background: {
      default: '#161312', //background color black
    },
  },

  typography: {
    fontFamily: "'Poppins', sans-serif",
    h1: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 500,
    },
  },
});
