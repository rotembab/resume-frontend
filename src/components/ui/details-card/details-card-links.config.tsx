import { GitHub, LinkedIn, MailOutline } from '@mui/icons-material';
import { DetailsCardLink } from '../../../interfaces/ui/details-card/details-card-link.interface';
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
