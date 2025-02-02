// Adjust the import path as necessary

import {
  BusinessCenterOutlined,
  ColorizeOutlined,
  FolderOutlined,
  HomeOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';

export type NavMenuItem = {
  tooltip: string;
  icon: JSX.Element;
  onClick?: () => void;
};

export const NavMenuConfig = () => {
  let navigate = useNavigate();
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
      onclick: () => {
        alert('clicked');
        navigate('/projects');
      },
    },
    {
      tooltip: 'Experience',
      icon: <BusinessCenterOutlined />,
      onclick: () => {
        navigate('/experience');
      },
    },
    {
      tooltip: 'Tools',
      icon: <ColorizeOutlined />,
      onclick: () => {
        navigate('/tools');
      },
    },
  ] as NavMenuItem[];
};
