import { useTranslation } from 'react-i18next';
import { Resume } from './resume.schema';
import resumeEn from './resume.json';
import resumeHe from './resume.he.json';
import resumeJp from './resume.jp.json';

const RESUMES: Record<string, Resume> = {
  en: resumeEn as Resume,
  he: resumeHe as Resume,
  jp: resumeJp as Resume,
};

export const useResume = (): Resume => {
  const { i18n } = useTranslation();
  return RESUMES[i18n.language] ?? RESUMES.en;
};
