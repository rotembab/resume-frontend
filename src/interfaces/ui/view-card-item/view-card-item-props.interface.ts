export interface ViewCardItemProps {
  title: string;
  description: string;
  thumbnail?: string;
  link: string;
  footer?: React.ReactNode;
  isExternal?: boolean;
}
