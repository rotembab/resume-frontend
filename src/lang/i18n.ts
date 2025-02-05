import i18n, { t } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { enTranslations } from './en';
import { heTranslations } from './he';

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: {
      translation: {
        ...enTranslations,
      },
    },
    he: {
      translation: {
        ...heTranslations,
      },
    },
  },
});

export default i18n;
