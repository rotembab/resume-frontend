import { Button } from '@mui/material';

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    customColors: true;
  }
}

type AppButtonProps = {
  onClick?: () => void;
  Text?: string;
  style?: React.CSSProperties;
  Icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'customColors';
};

export const AppButton = ({
  onClick,
  Text,
  style,
  Icon,
  color,
}: AppButtonProps) => {
  return (
    <Button
      style={style}
      onClick={onClick}
      startIcon={Icon}
      color={color ?? 'secondary'}
    >
      {Text}
    </Button>
  );
};
