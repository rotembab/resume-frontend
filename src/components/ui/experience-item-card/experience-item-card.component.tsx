import { BaseViewCard } from '../base-view-card/base-view-card.component';

type ExperienceItemCardProps = {
  title: string;
  subtitle: string;
  description: string;
  bullets?: string[];
};
export const ExperienceItemCard = ({
  title,
  subtitle,
  description,
  bullets,
}: ExperienceItemCardProps) => {
  return (
    <BaseViewCard
      title={title}
      subtitle={subtitle}
      description={description}
      bullets={bullets}
      onClick={() => {}}
      isInteractive={false}
      height='min-content'
      width='100%'
      imgHeight='0px'
      imgWidth='0px'
      isShowArrow={false}
      footer={null}
    />
  );
};
