import { AppBar, Box, Fade, Icon, Tooltip } from '@mui/material';
import { customColors } from '../../../themes/custom-colors';
import { NavMenuConfig } from './nav-menu-config';

type NavMenuProps = {};

export const NavMenu = ({}: NavMenuProps) => {
  const config = NavMenuConfig();
  return (
    <AppBar
      color='transparent'
      sx={{
        padding: '10px 20px',
        position: 'absolute',
        width: 'max-content',
        top: 30,
        left: '50%',
        transform: 'translateX(-50%)',
        borderRadius: '10px',
        backgroundColor: customColors.hoverColor.main,
      }}
    >
      <Box>
        {config.map((item) => {
          return (
            <Tooltip
              slots={{
                transition: Fade,
              }}
              title={item.tooltip}
              placement='bottom'
            >
              <Icon
                key={item.icon.props.viewBox}
                onClick={item.onClick}
                color='secondary'
                sx={{
                  cursor: 'pointer',
                  margin: '0 10px',
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
