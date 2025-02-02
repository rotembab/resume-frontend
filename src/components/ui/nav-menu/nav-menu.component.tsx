import { AppBar, Box } from '@mui/material';
import { customColors } from '../../../themes/custom-colors';

type NavMenuProps = {};

export const NavMenu = ({}: NavMenuProps) => {
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
      <Box>{}</Box>
    </AppBar>
  );
};
