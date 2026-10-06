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
      }
    : code === 'jp' || code === 'ja'
      ? {
          label: 'ツールのコレクション',
          fullPage: 'ツールのページを見る',
          tool: 'ツール',
          scroll: 'スクロールしてツールをご覧ください。',
          manual: 'ツールを選んでご覧ください。',
          docs: '公式サイト',
        }
      : {
          label: 'The toolkit',
          fullPage: 'Explore the toolkit',
          tool: 'Tool',
          scroll: 'Scroll through the tools.',
          manual: 'Choose a tool to explore.',
          docs: 'Official website',
        };
};
