export type WalkthroughView = 'interface' | 'behind';
export type WalkthroughStep =
  | 'import'
  | 'process'
  | 'validate'
  | 'review'
  | 'export';
export type WalkthroughNode =
  | 'browser'
  | 'server'
  | 'model'
  | 'validation'
  | 'output';

export const WALKTHROUGH_STEPS: {
  id: WalkthroughStep;
  region: { left: number; top: number; width: number; height: number };
  nodes: WalkthroughNode[];
}[] = [
  {
    id: 'import',
    region: { left: 1.7, top: 16.3, width: 18, height: 15 },
    nodes: ['browser'],
  },
  {
    id: 'process',
    region: { left: 1.7, top: 37.4, width: 18, height: 16 },
    nodes: ['server', 'model'],
  },
  {
    id: 'validate',
    region: { left: 23.4, top: 33.4, width: 9.8, height: 65.5 },
    nodes: ['validation'],
  },
  {
    id: 'review',
    region: { left: 65.5, top: 38, width: 30.6, height: 61 },
    nodes: ['output'],
  },
  {
    id: 'export',
    region: { left: 86.9, top: 15.7, width: 9.2, height: 4.3 },
    nodes: ['output'],
  },
];

export const WALKTHROUGH_NODES: WalkthroughNode[] = [
  'browser',
  'server',
  'model',
  'validation',
  'output',
];

export interface WalkthroughCopy {
  eyebrow: string;
  title: string;
  description: string;
  viewLabel: string;
  stepsLabel: string;
  diagramLabel: string;
  imageNote: string;
  imageUnavailable: string;
  note: string;
  views: Record<WalkthroughView, string>;
  steps: Record<
    WalkthroughStep,
    { label: string; interface: string; behind: string }
  >;
  nodes: Record<WalkthroughNode, { label: string; description: string }>;
}

const en: WalkthroughCopy = {
  eyebrow: 'Guided walkthrough',
  title: 'Inspect the build.',
  description:
    'Follow a subtitle from import to export, through the interface and the code behind it.',
  viewLabel: 'Walkthrough views',
  stepsLabel: 'Subtitle workflow steps',
  diagramLabel: 'Local subtitle processing architecture',
  imageNote:
    'Actual interface capture with the included fictional English example. Translation has not started.',
  imageUnavailable:
    'The interface capture is unavailable. Step descriptions and the architecture view remain available.',
  note: 'A guided explanation of the project. Selecting a step changes the illustration; no live translation runs here.',
  views: { interface: 'Interface', behind: 'Behind the interface' },
  steps: {
    import: {
      label: 'Import',
      interface:
        'The file picker accepts SRT or WebVTT. The included example loads English dialogue with its cue IDs and original timing.',
      behind:
        'The browser parses the subtitle file into source cues. The local server checks the source again when translation is requested.',
    },
    process: {
      label: 'Local processing',
      interface:
        'The local-model controls select an installed Ollama model. Dialogue notes can clarify characters and context before translation.',
      behind:
        'A local Node.js server prepares dialogue context and sends sequential translation batches to Ollama on the same computer.',
    },
    validate: {
      label: 'Validate',
      interface:
        'The cue and time column stays tied to the original file. Model replies must pass server-side checks before the editor accepts them.',
      behind:
        'Structured model output is checked for cue IDs, order, nonempty text and preserved formatting tags before a batch returns to the browser.',
    },
    review: {
      label: 'Review',
      interface:
        'The editor places source dialogue beside editable Hebrew. This capture precedes translation, so the Hebrew fields are still empty.',
      behind:
        'Validated batches return to the browser for human review. People can edit translations and inspect readability or ambiguity flags.',
    },
    export: {
      label: 'Export',
      interface:
        'Export is inactive in this untranslated capture. The app enables it when every cue has text, preserving the original timing.',
      behind:
        'The browser exports SRT or WebVTT with the original timestamps, cue identifiers and supported metadata. It does not retime the subtitles.',
    },
  },
  nodes: {
    browser: {
      label: 'Browser',
      description: 'Import source cues and context.',
    },
    server: {
      label: 'Local Node.js server',
      description: 'Prepare context and translation batches.',
    },
    model: {
      label: 'Local Ollama model',
      description: 'Return structured translation output.',
    },
    validation: {
      label: 'Validation',
      description: 'Check IDs, text and formatting.',
    },
    output: {
      label: 'Browser review & export',
      description: 'Human edits, then a timed subtitle file.',
    },
  },
};

const he: WalkthroughCopy = {
  eyebrow: 'סיור מודרך',
  title: 'מבט לתוך הפרויקט.',
  description: 'מייבוא כתוביות ועד ייצוא, דרך הממשק והקוד שמאחוריו.',
  viewLabel: 'תצוגות הסיור',
  stepsLabel: 'שלבי עיבוד הכתוביות',
  diagramLabel: 'ארכיטקטורת עיבוד כתוביות מקומי',
  imageNote:
    'צילום הממשק האמיתי עם דוגמת הכתוביות הבדיונית המצורפת באנגלית. התרגום טרם התחיל.',
  imageUnavailable:
    'צילום הממשק אינו זמין. תיאורי השלבים ותצוגת הארכיטקטורה עדיין זמינים.',
  note: 'הסבר מודרך על הפרויקט. בחירת שלב משנה את ההמחשה; לא מתבצע כאן תרגום חי.',
  views: { interface: 'הממשק', behind: 'מאחורי הממשק' },
  steps: {
    import: {
      label: 'ייבוא',
      interface:
        'בוחר הקבצים מקבל SRT או WebVTT. הדוגמה המצורפת מציגה דיאלוג באנגלית עם מזהי הכתוביות והתזמון המקורי.',
      behind:
        'הדפדפן מפרק את קובץ הכתוביות למקטעי מקור. השרת המקומי בודק שוב את המקור בעת בקשת תרגום.',
    },
    process: {
      label: 'עיבוד מקומי',
      interface:
        'בקרי המודל המקומי בוחרים מודל Ollama מותקן. הערות על הדיאלוג יכולות להבהיר דמויות והקשר לפני התרגום.',
      behind:
        'שרת Node.js מקומי מכין את הקשר הדיאלוג ושולח קבוצות תרגום לפי סדר ל-Ollama באותו מחשב.',
    },
    validate: {
      label: 'אימות',
      interface:
        'עמודת המזהים והתזמון נשארת קשורה לקובץ המקורי. תשובות המודל חייבות לעבור בדיקות בשרת לפני קבלתן בעורך.',
      behind:
        'פלט המודל המובנה נבדק כדי לוודא מזהים וסדר תקינים, טקסט שאינו ריק ושמירת תגיות עיצוב, לפני החזרתו לדפדפן.',
    },
    review: {
      label: 'בדיקה אנושית',
      interface:
        'העורך מציג את דיאלוג המקור לצד עברית הניתנת לעריכה. הצילום נעשה לפני התרגום, ולכן שדות העברית עדיין ריקים.',
      behind:
        'קבוצות שאומתו חוזרות לדפדפן לבדיקה אנושית. ניתן לערוך תרגומים ולבחון סימוני קריאות או עמימות.',
    },
    export: {
      label: 'ייצוא',
      interface:
        'הייצוא אינו פעיל בצילום שטרם תורגם. היישום מאפשר אותו כשבכל מקטע יש טקסט, תוך שמירת התזמון המקורי.',
      behind:
        'הדפדפן מייצא SRT או WebVTT עם התזמון, מזהי המקטעים והמטא-נתונים הנתמכים המקוריים. הוא אינו משנה את תזמון הכתוביות.',
    },
  },
  nodes: {
    browser: { label: 'דפדפן', description: 'ייבוא מקטעי מקור והקשר.' },
    server: {
      label: 'שרת Node.js מקומי',
      description: 'הכנת הקשר וקבוצות תרגום.',
    },
    model: {
      label: 'מודל Ollama מקומי',
      description: 'החזרת פלט תרגום מובנה.',
    },
    validation: { label: 'אימות', description: 'בדיקת מזהים, טקסט ועיצוב.' },
    output: {
      label: 'בדיקה וייצוא בדפדפן',
      description: 'עריכה אנושית, ואז קובץ כתוביות מתוזמן.',
    },
  },
};

const jp: WalkthroughCopy = {
  eyebrow: 'ガイド付きウォークスルー',
  title: '制作の仕組みを見る。',
  description:
    '読み込みから書き出しまで、字幕を操作画面と内部のコードでたどります。',
  viewLabel: 'ウォークスルーの表示',
  stepsLabel: '字幕処理の手順',
  diagramLabel: 'ローカル字幕処理の構成',
  imageNote:
    '付属の架空の英語字幕を読み込んだ実際の操作画面です。翻訳はまだ始まっていません。',
  imageUnavailable:
    '操作画面の画像を表示できません。各手順の説明と構成図は引き続き利用できます。',
  note: 'プロジェクトの仕組みを説明するガイドです。手順を選ぶと図が切り替わります。ここでは実際の翻訳は実行しません。',
  views: { interface: '操作画面', behind: '操作画面の裏側' },
  steps: {
    import: {
      label: '読み込み',
      interface:
        'ファイル選択でSRTやWebVTTを読み込みます。付属の例には、元の字幕IDと時刻を持つ英語の会話が入っています。',
      behind:
        'ブラウザーが字幕ファイルを原文の項目に分解します。翻訳を要求すると、ローカルサーバーが原文を再確認します。',
    },
    process: {
      label: 'ローカル処理',
      interface:
        'モデル選択でインストール済みのOllamaモデルを選びます。会話のメモで、翻訳前に登場人物や文脈を補足できます。',
      behind:
        'ローカルのNode.jsサーバーが会話の文脈を準備し、同じコンピューター上のOllamaに翻訳のバッチを順番に送ります。',
    },
    validate: {
      label: '検証',
      interface:
        '字幕IDと時刻の列は元のファイルに対応します。モデルの返答は、編集画面に取り込まれる前にサーバー側で検証されます。',
      behind:
        '構造化されたモデルの出力について、字幕ID、順序、空でない本文、書式タグの保持を確認してからブラウザーへ返します。',
    },
    review: {
      label: '人による確認',
      interface:
        '原文と編集可能なヘブライ語を並べて表示します。この画像は翻訳前なので、ヘブライ語の入力欄はまだ空です。',
      behind:
        '検証済みのバッチをブラウザーへ返し、人が確認します。翻訳を編集し、読みやすさや曖昧さの警告を確認できます。',
    },
    export: {
      label: '書き出し',
      interface:
        '未翻訳のこの画像では書き出しは無効です。すべての項目に本文が入ると、元の時刻を保って書き出せます。',
      behind:
        'ブラウザーが元の時刻、字幕ID、対応するメタデータを保持したSRTやWebVTTを書き出します。字幕の時刻は変更しません。',
    },
  },
  nodes: {
    browser: {
      label: 'ブラウザー',
      description: '原文の字幕と文脈を読み込む。',
    },
    server: {
      label: 'ローカルNode.jsサーバー',
      description: '文脈と翻訳バッチを準備する。',
    },
    model: {
      label: 'ローカルOllamaモデル',
      description: '構造化された翻訳を返す。',
    },
    validation: {
      label: '検証',
      description: '字幕ID、本文、書式を確認する。',
    },
    output: {
      label: 'ブラウザーで確認・書き出し',
      description: '人が編集し、時刻付き字幕ファイルを作る。',
    },
  },
};

export function getWalkthroughCopy(language: string): WalkthroughCopy {
  const code = language.toLowerCase().split(/[-_]/)[0];
  if (code === 'he') return he;
  if (code === 'jp' || code === 'ja') return jp;
  return en;
}
