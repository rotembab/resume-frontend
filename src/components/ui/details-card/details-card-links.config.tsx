import { GitHub, LinkedIn, MailOutline } from '@mui/icons-material';
import { DetailsCardLink } from '../../../interfaces/ui/details-card/details-card-link.interface';
import { Resume } from '../../../data/resume.schema';

export const buildDetailsCardLinks = (
  social: Resume['profile']['social']
): DetailsCardLink[] => {
  const links: DetailsCardLink[] = [];
  if (social.linkedin) {
    links.push({
      icon: <LinkedIn color='primary' />,
      link: social.linkedin,
      label: 'LinkedIn',
    });
  }
  if (social.github) {
    links.push({
      icon: <GitHub color='primary' />,
      link: social.github,
      label: 'GitHub',
    });
  }
  if (social.email) {
    links.push({
      icon: <MailOutline color='primary' />,
      link: `mailto:${social.email}`,
      label: 'Email',
    });
  }
  return links;
};
