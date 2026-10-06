export interface CarouselCopy {
  label: string;
  carouselRole: string;
  slideRole: string;
  instruction: string;
  manualInstruction: string;
  chapterLabel: string;
  viewAll: string;
  roleLabel: string;
  contributionLabel: string;
  empty: string;
  position: (index: number, total: number, title: string) => string;
}

const en: CarouselCopy = {
  label: 'Explore the projects',
  carouselRole: 'carousel',
  slideRole: 'project',
  instruction: 'Scroll through the work, or choose a project.',
  manualInstruction: 'Choose a project to explore.',
  chapterLabel: 'Project',
  viewAll: 'View all projects',
  roleLabel: 'My role',
  contributionLabel: 'What I built',
  empty: 'No projects to show.',
  position: (index, total, title) =>
    `Project ${index + 1} of ${total}: ${title}`,
};

const he: CarouselCopy = {
  label: 'להכיר את הפרויקטים',
  carouselRole: 'קרוסלה',
  slideRole: 'פרויקט',
  instruction: 'גללו בין הפרויקטים או בחרו פרויקט.',
  manualInstruction: 'בחרו פרויקט כדי להכיר אותו.',
  chapterLabel: 'פרויקט',
  viewAll: 'לכל הפרויקטים',
  roleLabel: 'התפקיד שלי',
  contributionLabel: 'מה בניתי',
  empty: 'אין פרויקטים להצגה.',
  position: (index, total, title) =>
    `פרויקט ${index + 1} מתוך ${total}: ${title}`,
};

const jp: CarouselCopy = {
  label: 'プロジェクトを見る',
  carouselRole: 'カルーセル',
  slideRole: 'プロジェクト',
  instruction: 'スクロールするか、作品を選んでご覧ください。',
  manualInstruction: '作品を選んでご覧ください。',
  chapterLabel: '作品',
  viewAll: 'すべての作品を見る',
  roleLabel: '担当した役割',
  contributionLabel: '実装したもの',
  empty: '表示できるプロジェクトはありません。',
  position: (index, total, title) => `全${total}件中${index + 1}件目：${title}`,
};

export function getCarouselCopy(language: string): CarouselCopy {
  const code = language.toLowerCase().split(/[-_]/)[0];
  if (code === 'he') return he;
  if (code === 'jp' || code === 'ja') return jp;
  return en;
}
