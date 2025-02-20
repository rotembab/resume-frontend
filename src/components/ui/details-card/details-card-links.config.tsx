import { GitHub, LinkedIn, Mail, MailOutline } from '@mui/icons-material';

export interface DetailsCardLink {
  icon: React.ReactNode;
  link: string;
}

export const detailsCardLinks = [
  {
    icon: <LinkedIn color='primary' />,
    link: 'https://www.linkedin.com/in/rotem-babani-971930200/',
  },
  {
    icon: <GitHub color='primary' />,
    link: 'https://github.com/rotembab',
  },
  {
    icon: <MailOutline color='primary' />,
    link: 'mailto:rotembabmen@gmail.com',
  },
] as DetailsCardLink[];
