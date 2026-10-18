export const getToolDeckCopy = (language: string) => {
  const code = language.split(/[-_]/)[0];
  return code === 'he'
    ? {
        label: 'ערכת הכלים',
        fullPage: 'לכל ערכת הכלים',
        tool: 'כלי',
        scroll: 'גללו כדי לעבור בין הכלים.',
        manual: 'בחרו כלי כדי להכיר אותו.',
        docs: 'לאתר הכלי',
        globeLabel: 'הטכנולוגיות שאני עובד איתן',
        globeHint: 'גררו כדי לסובב · בחרו כלי כדי לראות איפה השתמשתי בו',
        globeItem: (name: string) => name + ': הצגה בערכת הכלים',
      }
    : code === 'jp' || code === 'ja'
      ? {
          label: 'ツールのコレクション',
          fullPage: 'ツールのページを見る',
          tool: 'ツール',
          scroll: 'スクロールしてツールをご覧ください。',
          manual: 'ツールを選んでご覧ください。',
          docs: '公式サイト',
          globeLabel: '使っている技術',
          globeHint: 'ドラッグで回転・ツールを選ぶと使用例を表示',
          globeItem: (name: string) => name + '：ツールで見る',
        }
      : {
          label: 'The toolkit',
          fullPage: 'Explore the toolkit',
          tool: 'Tool',
          scroll: 'Scroll through the tools.',
          manual: 'Choose a tool to explore.',
          docs: 'Official website',
          globeLabel: 'Technologies I work with',
          globeHint: 'Drag to spin · Pick a tool to see where I used it',
          globeItem: (name: string) => name + ': see it in the toolkit',
        };
};
