export const customColors = {
  background: { main: '#151412', contrastText: '#fff' },
  hoverColor: { main: '#1E1D1C', contrastText: '#fff' },
  headingDarkColor: { main: '#3B393A', contrastText: '#fff' },
  headingLightColor: { main: '#FFFFFF', contrastText: '#000' },
  descriptionColor: { main: '#7A7B7D', contrastText: '#fff' },
  paragraphColor: { main: '#998F8F', contrastText: '#fff' },
  inputColor: { main: '#3B393A', contrastText: '#999999' },
  tabLinkCard1: { main: '#F46C38', contrastText: '#fff' },
  tabLinkCard2: { main: '#C5FF41', contrastText: '#000' },
};

export type CustomColor = keyof typeof customColors;
