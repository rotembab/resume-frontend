import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { CustomColor, customColors } from './custom-colors';
import { CSSProperties } from 'react';
import { customSizes, customSizesMediaQuery } from './custom-sizes-query';

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
declare module '@mui/material/AppBar' {
  interface AppBarPropsColorOverrides extends Record<CustomColor, true> {}
}
declare module '@mui/material/Box' {
  interface BoxPropsColorOverrides extends Record<CustomColor, true> {}
}
declare module '@mui/material/TextField' {
  interface TextFieldPropsColorOverrides extends Record<CustomColor, true> {}
}

export const AppTheme = responsiveFontSizes(
  createTheme({
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
    breakpoints: {
      values: {
        ...customSizes,
      },
    },
    typography: {
      fontFamily: "'Inter', sans-serif",

      caption: {
        fontWeight: 400,
        fontSize: '20px',

        [customSizesMediaQuery.md]: {
          textAlign: 'center',
          margin: 'auto',
        },
        [customSizesMediaQuery.sm]: {
          textAlign: 'center',
          margin: 'auto',
        },
        [customSizesMediaQuery.xs]: {
          textAlign: 'center',
          margin: 'auto',
        },
      },
      h1: {
        fontWeight: 700,
        fontFamily: "'Poppins', sans-serif",
        textTransform: 'uppercase',
        fontSize: '6.5rem',
        '@media (max-width:1200px)': {
          textAlign: 'center',
          margin: 'auto',
        },
        '@media (max-width:900px)': {
          fontSize: '3rem',
          textAlign: 'center',
        },
        '@media (max-width:600px)': {
          fontSize: '2rem',
          textAlign: 'center',
        },
      },
      h2: {
        fontWeight: 600,
        fontFamily: "'Poppins', sans-serif",
        fontSize: '70px',
        '@media (max-width:1200px)': {
          textAlign: 'center',
          margin: 'auto',
        },
        '@media (max-width:900px)': {
          fontSize: '36px',
          textAlign: 'center',
        },
        '@media (max-width:600px)': {
          fontSize: '24px',
          textAlign: 'center',
        },
      },
      h3: {
        fontWeight: 700,
        fontFamily: "'Poppins', sans-serif",
        fontSize: '36px',
      },
      button: {
        fontWeight: 700,
        fontFamily: "'Inter', sans-serif",
        textTransform: 'none',
      },
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            backgroundColor: customColors.inputColor.main,
            borderRadius: '10px',
            width: '100%',
            '& .MuiOutlinedInput-notchedOutline': {
              borderRadius: '10px',
            },
          },
        },
      },
    },
  })
);
