import { ReactNode, useEffect, useMemo } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { createAppTheme } from '../../../themes/theme';

const RTL_LANGUAGES = new Set(['he', 'ar', 'fa', 'ur']);

const ltrCache = createCache({
  key: 'mui',
  stylisPlugins: [prefixer],
});

const rtlCache = createCache({
  key: 'mui-rtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

export const DirectionProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();
  const isRtl = RTL_LANGUAGES.has(i18n.language);
  const direction = isRtl ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = i18n.language;
  }, [direction, i18n.language]);

  const theme = useMemo(() => createAppTheme(direction), [direction]);
  const cache = isRtl ? rtlCache : ltrCache;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
};
