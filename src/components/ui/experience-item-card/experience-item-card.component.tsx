import { useNavigate } from 'react-router';
import { BaseViewCard } from '../base-view-card/base-view-card.component';

type ExperienceItemCardProps = {
  title: string;
  subtitle: string;
  description: string;
  bullets?: string[];
  link?: string;
};
export const ExperienceItemCard = ({
  title,
  subtitle,
  description,
  bullets,
  link,
}: ExperienceItemCardProps) => {
  const navigate = useNavigate();
  const isInteractive = Boolean(link);
  return (
    <BaseViewCard
      title={title}
      subtitle={subtitle}
      description={description}
      bullets={bullets}
      onClick={() => link && navigate(link)}
      isInteractive={isInteractive}
      height='min-content'
      width='100%'
      imgHeight='0px'
      imgWidth='0px'
      isShowArrow={isInteractive}
      footer={null}
    />
  );
};
