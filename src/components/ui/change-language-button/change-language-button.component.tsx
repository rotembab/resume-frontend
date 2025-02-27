import { Box, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { availableLanguages } from '../../../lang/i18n';
export const ChangeLanguageButton = () => {
  const { i18n } = useTranslation();
  const [langIndex, setLangIndex] = useState(
    availableLanguages.findIndex((lang: string) => lang === i18n.language)
  );

  useEffect(() => {
    i18n.changeLanguage(availableLanguages[langIndex]);
  }, [langIndex]);

  return (
    <IconButton
      color='secondary'
      onClick={() => setLangIndex((langIndex + 1) % availableLanguages.length)}
      sx={{
        textAlign: 'center',
        padding: '0',

        maxWidth: '24px',
        maxHeight: '24px',
        margin: 'auto',
        fontSize: '1.3rem',
      }}
    >
      <Box marginTop={'4px'}>{availableLanguages[langIndex].toUpperCase()}</Box>
    </IconButton>
  );
};
