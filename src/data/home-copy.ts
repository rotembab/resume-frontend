const en = {
  allProjects: 'View all projects',
  featuredTitle: 'Projects, in motion.',
  featuredDescription:
    'Scroll to explore every project, from interfaces and systems to games and experiments.',
  aboutTitle: 'The person behind the code.',
  education: 'Education',
  experience: 'Explore my experience',
  capabilities: 'From interface to delivery.',
};
type HomeCopy = typeof en;
const he: HomeCopy = {
  allProjects: 'לכל הפרויקטים',
  featuredTitle: 'הפרויקטים בתנועה.',
  featuredDescription:
    'גללו כדי להכיר כל פרויקט, מממשקים ומערכות ועד משחקים וניסויים.',
  aboutTitle: 'האדם שמאחורי הקוד.',
  education: 'השכלה',
  experience: 'לניסיון המקצועי שלי',
  capabilities: 'מהממשק ועד למסירה.',
};
const jp: HomeCopy = {
  allProjects: 'すべてのプロジェクト',
  featuredTitle: '動きのあるプロジェクト。',
  featuredDescription:
    'スクロールして、インターフェース、システム、ゲーム、実験の全作品をご覧ください。',
  aboutTitle: 'コードの向こうにいる人。',
  education: '学歴',
  experience: '職務経験を見る',
  capabilities: 'インターフェースから提供まで。',
};
export const getHomeCopy = (language: string): HomeCopy => {
  const code = language.toLowerCase().split(/[-_]/)[0];
  return code === 'he' ? he : code === 'jp' || code === 'ja' ? jp : en;
};
