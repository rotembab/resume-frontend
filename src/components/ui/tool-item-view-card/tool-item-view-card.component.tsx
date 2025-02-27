import { BaseViewCard } from '../base-view-card/base-view-card.component';

type ToolItemViewCardProps = {
  title: string;
  description: string;
  thumbnail: string;
  link: string;
};
export const ToolItemViewCard = ({
  title,
  description,
  thumbnail,
  link,
}: ToolItemViewCardProps) => {
  return (
    <BaseViewCard
      title={title}
      description={description}
      thumbnail={thumbnail}
      onClick={() => window.open(link, '_blank')}
      height='min-content'
      width='100%'
      imgHeight='60px'
      imgWidth='60px'
      isShowArrow={false}
      footer={null}
      imgBackground={'white'}
    />
  );
};
