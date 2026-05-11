import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@mui/icons-material')) return 'mui-icons';
          if (id.includes('@mui/material') || id.includes('@mui/system'))
            return 'mui';
          if (id.includes('@emotion')) return 'emotion';
          if (
            id.includes('motion-dom') ||
            id.includes('motion-utils') ||
            id.includes('framer-motion') ||
            id.includes('node_modules/motion/')
          )
            return 'motion';
          if (id.includes('react-router') || id.includes('@remix-run/router'))
            return 'router';
          if (id.includes('@tanstack/react-query')) return 'react-query';
          if (id.includes('formik') || id.includes('yup')) return 'forms';
          if (id.includes('i18next')) return 'i18n';
          if (id.includes('@emailjs')) return 'emailjs';
          return undefined;
        },
      },
    },
  },
});
