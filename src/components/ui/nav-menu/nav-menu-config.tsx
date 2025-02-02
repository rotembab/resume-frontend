// Adjust the import path as necessary

import {
  BusinessCenterOutlined,
  ColorizeOutlined,
  FolderOutlined,
  HomeOutlined,
} from '@mui/icons-material';

export type NavMenuItem = {
  tooltip: string;
  icon: JSX.Element;
  onClick?: () => void;
};

export const NavMenuConfig = () =>
  [
    {
      tooltip: 'Home',
      icon: <HomeOutlined />,
      onClick: () => {},
    },
    {
      tooltip: 'Projects',
      icon: <FolderOutlined />,
      onclick: () => {},
    },
    {
      tooltip: 'Experience',
      icon: <BusinessCenterOutlined />,
      onclick: () => {},
    },
    {
      tooltip: 'Tools',
      //make the icon mirror horizontally

      icon: <ColorizeOutlined />,
    },
  ] as NavMenuItem[];
