export type CatalogLanguage = 'en' | 'he' | 'jp';

export interface CatalogCopy {
  title: string;
  description: string;
  search: string;
  filter: string;
  technology: string;
  all: string;
  allTechnologies: string;
  reset: string;
  results: (count: number) => string;
  noResults: string;
  source: string;
  details: string;
  statuses: Record<
    'personal-project' | 'prototype' | 'learning-project' | 'repository',
    string
  >;
  illustration: string;
  technicalIllustration: string;
  snapshot: string;
  current: string;
  freshness: string;
  loading: string;
  error: string;
  fallback: string;
  retry: string;
  refreshed: string;
  overview: string;
  features: string;
  notes: string;
  updated: string;
  facts: string;
  learning: string;
}

const copy: Record<CatalogLanguage, CatalogCopy> = {
  en: {
    title: 'Projects',
    description:
      'A complete view of my public repositories, from software tools to game prototypes and search algorithms.',
    search: 'Search projects or technologies',
    filter: 'Filter projects',
    technology: 'Technology',
    all: 'All projects',
    allTechnologies: 'All technologies',
    reset: 'Reset filters',
    results: (count) => `${count} ${count === 1 ? 'project' : 'projects'}`,
    noResults: 'No projects match these filters.',
    source: 'View source',
    details: 'Explore project',
    statuses: {
      'personal-project': 'Personal project',
      prototype: 'Prototype',
      'learning-project': 'Learning project',
      repository: 'Repository',
    },
    illustration: 'Technical illustration',
    technicalIllustration: 'Technical illustration',
    snapshot: 'Saved repository snapshot',
    current: 'Public GitHub repositories',
    freshness: 'Repository data',
    loading: 'Refreshing repositories…',
    error: 'GitHub is unavailable. Showing the last complete catalog.',
    fallback: 'Showing a saved catalog while GitHub is unavailable.',
    retry: 'Retry',
    refreshed: 'Last refreshed',
    overview: 'Overview',
    features: 'Implementation',
    notes: 'Project notes',
    updated: 'Repository updated',
    facts: 'Project facts',
    learning: 'Learning and exploration',
  },
  he: {
    title: 'פרויקטים',
    description:
      'כל המאגרים הציבוריים שלי: כלי תוכנה, אבות־טיפוס למשחקים ואלגוריתמי חיפוש.',
    search: 'חיפוש פרויקטים או טכנולוגיות',
    filter: 'סינון פרויקטים',
    technology: 'טכנולוגיה',
    all: 'כל הפרויקטים',
    allTechnologies: 'כל הטכנולוגיות',
    reset: 'איפוס מסננים',
    results: (count) => (count === 1 ? 'פרויקט אחד' : `${count} פרויקטים`),
    noResults: 'אין פרויקטים שמתאימים למסננים האלה.',
    source: 'לקוד המקור',
    details: 'לפרטי הפרויקט',
    statuses: {
      'personal-project': 'פרויקט אישי',
      prototype: 'אב־טיפוס',
      'learning-project': 'פרויקט לימודי',
      repository: 'מאגר קוד',
    },
    illustration: 'איור טכני',
    technicalIllustration: 'איור טכני',
    snapshot: 'עותק שמור של רשימת המאגרים',
    current: 'מאגרים ציבוריים ב-GitHub',
    freshness: 'נתוני המאגרים',
    loading: 'מעדכן את רשימת המאגרים…',
    error: 'GitHub אינו זמין. מוצגת רשימת הפרויקטים המלאה האחרונה.',
    fallback: 'מוצגת רשימה שמורה בזמן ש-GitHub אינו זמין.',
    retry: 'ניסיון נוסף',
    refreshed: 'רענון אחרון',
    overview: 'סקירה',
    features: 'המימוש',
    notes: 'הערות על הפרויקט',
    updated: 'עדכון המאגר',
    facts: 'פרטי הפרויקט',
    learning: 'למידה והתנסות',
  },
  jp: {
    title: 'プロジェクト',
    description:
      'ソフトウェアツール、ゲームの試作、探索アルゴリズムまで、公開リポジトリを一覧で紹介します。',
    search: 'プロジェクトや技術を検索',
    filter: 'プロジェクトを絞り込む',
    technology: '技術',
    all: 'すべてのプロジェクト',
    allTechnologies: 'すべての技術',
    reset: '絞り込みを解除',
    results: (count) => `${count}件のプロジェクト`,
    noResults: '条件に一致するプロジェクトはありません。',
    source: 'ソースを見る',
    details: 'プロジェクトを見る',
    statuses: {
      'personal-project': '個人プロジェクト',
      prototype: '試作',
      'learning-project': '学習プロジェクト',
      repository: 'リポジトリ',
    },
    illustration: '技術構成の図',
    technicalIllustration: '技術構成の図',
    snapshot: '保存済みのリポジトリ一覧',
    current: 'GitHubの公開リポジトリ',
    freshness: 'リポジトリのデータ',
    loading: 'リポジトリを更新中…',
    error: 'GitHubに接続できません。最後に取得した完全な一覧を表示しています。',
    fallback: 'GitHubに接続できないため、保存済みの一覧を表示しています。',
    retry: '再試行',
    refreshed: '最終取得',
    overview: '概要',
    features: '実装',
    notes: 'プロジェクトの補足',
    updated: 'リポジトリ更新日',
    facts: 'プロジェクト情報',
    learning: '学習と実験',
  },
};

export function getCatalogLanguage(language: string): CatalogLanguage {
  const code = language.toLowerCase().split(/[-_]/)[0];
  return code === 'he' ? 'he' : code === 'jp' || code === 'ja' ? 'jp' : 'en';
}

export function getCatalogCopy(language: string): CatalogCopy {
  return copy[getCatalogLanguage(language)];
}
