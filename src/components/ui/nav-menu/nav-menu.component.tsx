import { AppBar, Box, Fade, Icon, Slide, Tooltip } from '@mui/material';
import { customColors } from '../../../themes/custom-colors';
import { NavMenuConfig } from './nav-menu-config';

type NavMenuProps = {};

export const NavMenu = ({}: NavMenuProps) => {
  const config = NavMenuConfig();
  return (
    <AppBar
      color='transparent'
      sx={{
        padding: '10px 25px',
        position: 'absolute',
        width: 'max-content',
        height: '48px',
        flexWrap: 'nowrap',
        top: 30,
        left: '50%',
        transform: 'translateX(-50%)',
        borderRadius: '15px',
        backgroundColor: customColors.hoverColor.main,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: '30px',
        }}
      >
        {config.map((item) => {
          return (
            <Tooltip title={item.tooltip} placement='bottom'>
              <Icon
                key={item.icon.props.viewBox}
                onClick={item.onClick}
                color='secondary'
                sx={{
                  cursor: 'pointer',
                }}
              >
                {item.icon}
              </Icon>
            </Tooltip>
          );
        })}
      </Box>
    </AppBar>
  );
};
