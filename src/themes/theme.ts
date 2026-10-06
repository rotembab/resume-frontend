import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import type { CustomColor } from './custom-colors';
import { CSSProperties } from 'react';
import { customSizes } from './custom-sizes-query';

type CustomPaletteColor = {
  main: CSSProperties['color'];
  contrastText?: CSSProperties['color'];
  light?: CSSProperties['color'];
  dark?: CSSProperties['color'];
};

declare module '@mui/material/styles' {
  interface Palette extends Record<CustomColor, CustomPaletteColor> {
    _customPaletteBrand?: never;
  }
  interface PaletteOptions
    extends Partial<Record<CustomColor, CustomPaletteColor>> {
    _customPaletteOptionsBrand?: never;
  }
}
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides extends Record<CustomColor, true> {
    _customButtonBrand?: never;
  }
}
declare module '@mui/material/AppBar' {
  interface AppBarPropsColorOverrides extends Record<CustomColor, true> {
    _customAppBarBrand?: never;
  }
}
declare module '@mui/material/Box' {
  interface BoxPropsColorOverrides extends Record<CustomColor, true> {
    _customBoxBrand?: never;
  }
}
declare module '@mui/material/TextField' {
  interface TextFieldPropsColorOverrides extends Record<CustomColor, true> {
    _customTextFieldBrand?: never;
  }
}

const colors = {
  canvas: '#000000',
  surface: '#161617',
  text: '#f5f5f7',
  muted: '#a1a1a6',
  accent: '#b91c1c',
  border: '#343436',
};
const bodyFont =
  "-apple-system, BlinkMacSystemFont, 'Inter', 'Noto Sans Hebrew', 'Noto Sans JP', sans-serif";
const displayFont = bodyFont;

export const createAppTheme = (direction: 'ltr' | 'rtl' = 'ltr') =>
  responsiveFontSizes(
    createTheme({
      direction,
      palette: {
        mode: 'dark',
        background: {
          default: colors.canvas,
          paper: colors.surface,
        },
        hoverColor: { main: colors.surface, contrastText: colors.text },
        headingDarkColor: { main: colors.text, contrastText: colors.canvas },
        headingLightColor: { main: colors.text, contrastText: colors.canvas },
        descriptionColor: { main: colors.muted, contrastText: colors.canvas },
        paragraphColor: { main: colors.muted, contrastText: colors.canvas },
        inputColor: { main: colors.surface, contrastText: colors.text },
        tabLinkCard1: { main: colors.accent, contrastText: '#FFFFFF' },
        tabLinkCard2: { main: colors.text, contrastText: colors.canvas },
        primary: {
          main: colors.accent,
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: colors.text,
          contrastText: colors.canvas,
        },
        divider: colors.border,
        text: {
          primary: colors.text,
          secondary: colors.muted,
        },
      },
      breakpoints: {
        values: {
          ...customSizes,
        },
      },
      typography: {
        fontFamily: bodyFont,
        body1: { fontSize: '1rem', lineHeight: 1.6 },
        body2: { fontSize: '0.875rem', lineHeight: 1.6 },
        caption: { fontSize: '0.8125rem', lineHeight: 1.5 },
        h1: {
          fontWeight: 600,
          fontFamily: displayFont,
          fontSize: '4.75rem',
          lineHeight: 1.05,
          letterSpacing: '-0.015em',
        },
        h2: {
          fontWeight: 500,
          fontFamily: displayFont,
          fontSize: '3rem',
          lineHeight: 1.18,
          letterSpacing: '-0.01em',
        },
        h3: {
          fontWeight: 500,
          fontFamily: displayFont,
          fontSize: '1.875rem',
          lineHeight: 1.3,
          letterSpacing: '-0.003em',
        },
        h4: {
          fontWeight: 500,
          fontFamily: displayFont,
          fontSize: '1.125rem',
          lineHeight: 1.4,
        },
        button: {
          fontWeight: 500,
          fontFamily: bodyFont,
          textTransform: 'none',
        },
      },
      shape: { borderRadius: 12 },
      components: {
        MuiButton: {
          styleOverrides: { root: { minHeight: 44, borderRadius: '999px' } },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              backgroundColor: colors.surface,
              borderRadius: '12px',
              width: '100%',
              '& .MuiOutlinedInput-notchedOutline': {
                borderRadius: '12px',
                borderColor: colors.muted,
              },
            },
          },
        },
      },
    })
  );

export const AppTheme = createAppTheme('ltr');
