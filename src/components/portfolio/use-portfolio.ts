import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { getPortfolioCopy } from '../../data/portfolio-copy';
import { getProjects } from '../../data/projects';
export const usePortfolio = () => {
  const { i18n } = useTranslation();
  const projects = useMemo(() => getProjects(i18n.language), [i18n.language]);
  return {
    copy: getPortfolioCopy(i18n.language),
    projects,
    i18n,
  };
};
