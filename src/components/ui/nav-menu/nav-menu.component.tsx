import { AppBar, Box, Icon, Tooltip } from '@mui/material';
import { customColors } from '../../../themes/custom-colors';
import { NavMenuConfig } from './nav-menu-config';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ChangeLanguageButton } from '../change-language-button/change-language-button.component';

export const NavMenu = () => {
  let navigate = useNavigate();
  const { t } = useTranslation();
  const config = NavMenuConfig(navigate, t);
  return (
    <AppBar
      color='transparent'
      sx={{
        padding: '10px 25px',
        width: 'max-content',
        height: '48px',
        flexWrap: 'nowrap',
        top: 30,
        left: '50%',
        position: 'relative',
        transform: 'translateX(-50%)',
        borderRadius: '15px',
        backgroundColor: customColors.hoverColor.main,
      }}
    >
      <Box
        key={'nav-menu-box'}
        sx={{
          display: 'flex',
          gap: '30px',
        }}
      >
        {config.map((item) => {
          return (
            <Tooltip
              key={`${item.tooltip}_tooltip`}
              title={item.tooltip}
              placement='bottom'
            >
              <Icon
                key={`${item.tooltip}_icon`}
                onClick={() => {
                  item.onClick?.();
                }}
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
        <ChangeLanguageButton />
      </Box>
    </AppBar>
  );
};
