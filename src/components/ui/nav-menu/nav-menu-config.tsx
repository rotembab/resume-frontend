// Adjust the import path as necessary

import {
  BusinessCenterOutlined,
  ColorizeOutlined,
  FolderOutlined,
  HomeOutlined,
} from '@mui/icons-material';
import { NavigateFunction } from 'react-router';

export type NavMenuItem = {
  tooltip: string;
  icon: JSX.Element;
  onClick?: () => void;
};

export const NavMenuConfig = (navigate: NavigateFunction) => {
  return [
    {
      tooltip: 'Home',
      icon: <HomeOutlined />,
      onClick: () => {
        navigate('/');
      },
    },
    {
      tooltip: 'Projects',
      icon: <FolderOutlined />,
      onClick: () => {
        navigate('/projects');
      },
    },
    {
      tooltip: 'Experience',
      icon: <BusinessCenterOutlined />,
      onClick: () => {
        navigate('/experience');
      },
    },
    {
      tooltip: 'Tools',
      icon: <ColorizeOutlined />,
      onClick: () => {
        navigate('/tools');
      },
    },
  ] as NavMenuItem[];
};
