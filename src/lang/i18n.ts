import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { enTranslations } from './en';
import { heTranslations } from './he';
import { jpTranslations } from './jp';

export const availableLanguages = ['en', 'he', 'jp'];

const initialLanguage = () => {
  try {
    const saved = localStorage.getItem('portfolio-language');
    return saved && availableLanguages.includes(saved) ? saved : 'en';
  } catch {
    return 'en';
  }
};

i18n.use(initReactI18next).init({
  lng: initialLanguage(),
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
    jp: {
      translation: {
        ...jpTranslations,
      },
    },
  },
});

export default i18n;
