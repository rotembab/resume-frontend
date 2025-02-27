// Adjust the import path as necessary

import {
  BuildOutlined,
  BusinessCenterOutlined,
  FolderOutlined,
  HomeOutlined,
  Phone,
} from '@mui/icons-material';
import { TFunction } from 'i18next';
import { NavigateFunction } from 'react-router';

export type NavMenuItem = {
  tooltip: string;
  icon: JSX.Element;
  onClick?: () => void;
};

export const NavMenuConfig = (
  navigate: NavigateFunction,
  t: TFunction<'translation', undefined>
) => {
  return [
    {
      tooltip: t('Home.title'),
      icon: <HomeOutlined />,
      onClick: () => {
        navigate('/');
      },
    },
    {
      tooltip: t('Projects.title'),
      icon: <FolderOutlined />,
      onClick: () => {
        navigate('/projects');
      },
    },
    {
      tooltip: t('Experience.title'),
      icon: <BusinessCenterOutlined />,
      onClick: () => {
        navigate('/experience');
      },
    },
    {
      tooltip: t('Tools.title'),
      icon: (
        <BuildOutlined
          sx={{
            fontSize: '22px',
          }}
        />
      ),
      onClick: () => {
        navigate('/tools');
      },
    },
    {
      tooltip: t('Contact.title'),
      icon: <Phone />,
      onClick: () => {
        navigate('/contact');
      },
    },
  ] as NavMenuItem[];
};
