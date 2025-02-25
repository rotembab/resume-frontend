export const customColors = {
  background: {
    main: '#151412',
    dark: '#151412',
    light: '#151412',
    contrastText: '#fff',
  },
  hoverColor: {
    main: '#1E1D1C',
    dark: '#1E1D1C',
    light: '#151412',
    contrastText: '#fff',
  },
  headingDarkColor: { main: '#3B393A', contrastText: '#fff' },
  headingLightColor: { main: '#FFFFFF', contrastText: '#000' },
  descriptionColor: { main: '#7A7B7D', contrastText: '#fff' },
  paragraphColor: { main: '#998F8F', contrastText: '#fff' },
  inputColor: { main: '#3B393A', contrastText: '#999999' },
};

export type CustomColor = keyof typeof customColors;
