import { getCatalogLanguage, type CatalogLanguage } from './catalog-copy';

export interface ProjectStoryCopy {
  eyebrow: string;
  headline: string;
  caption: string;
  features: [string, string];
}

type StorySlug =
  | 'hebrew-subtitle-studio'
  | 'esp32-claude-remote'
  | 'blaster'
  | 'cinema'
  | 'developer-portfolio'
  | 'flappy-bird-clone'
  | 'kitchen-chaos'
  | 'cinema-rest-api'
  | 'tic-tac-toe-ai'
  | 'multi-agent-search'
  | 'maze-search';

// Short presentation copy grounded in projects.ts and project-catalog.ts.
const stories: Record<CatalogLanguage, Record<StorySlug, ProjectStoryCopy>> = {
  en: {
    'hebrew-subtitle-studio': {
      eyebrow: 'Hebrew Subtitle Studio',
      headline: 'Translate subtitles. Keep the timing.',
      caption:
        'A local English-to-Hebrew workflow with context-aware translation, side-by-side editing, and human review.',
      features: [
        'Ollama translation batches with preserved SRT and WebVTT timestamps.',
        'Review flags, saved projects, and resumable translation.',
      ],
    },
    'esp32-claude-remote': {
      eyebrow: 'ESP32 Claude Remote',
      headline: 'A hardware bridge for AI coding.',
      caption:
        'A serial ESP32 prototype connects to a host-run Claude coding session through a Python WebSocket bridge.',
      features: [
        'Prompts, streamed output, interruptions, and permission handling.',
        'A browser client tests the shared bridge protocol.',
      ],
    },
    blaster: {
      eyebrow: 'Blaster',
      headline: 'Multiplayer starts with shared state.',
      caption:
        'An Unreal Engine 5 prototype for session discovery, weapon equipping, and synchronized aiming.',
      features: [
        'Reusable Online Subsystem session management.',
        'C++ gameplay with replication and server RPCs.',
      ],
    },
    cinema: {
      eyebrow: 'Cinema',
      headline: 'Movie browsing, from UI to API.',
      caption:
        'A React movie and news interface paired with an Express and MongoDB API, explored as a prototype.',
      features: [
        'Movie categories and a carousel in React.',
        'Separate API routes for movies, news, theaters, and screenings.',
      ],
    },
    'developer-portfolio': {
      eyebrow: 'Developer Portfolio',
      headline: 'Development, gathered in one place.',
      caption:
        'A React and TypeScript portfolio connecting public projects, professional experience, and three language interfaces.',
      features: [
        'Typed resume content in English, Hebrew, and Japanese.',
        'Public repository discovery alongside authored project stories.',
      ],
    },
    'flappy-bird-clone': {
      eyebrow: 'Flappy Bird Clone',
      headline: 'Fly through. Start again.',
      caption:
        'A Unity learning project with 2D bird physics, randomized pipes, scoring, and a restart loop.',
      features: [
        'Rigidbody2D movement and player input.',
        'Score display, game-over state, and menu navigation.',
      ],
    },
    'kitchen-chaos': {
      eyebrow: 'Kitchen Chaos',
      headline: 'Prepare. Cook. Beat the clock.',
      caption:
        'A Unity kitchen prototype exploring ingredient interactions, recipe matching, and timed deliveries.',
      features: [
        'ScriptableObject recipes and event-driven progress UI.',
        'Counter classes for preparation, cooking, plates, and delivery.',
      ],
    },
    'cinema-rest-api': {
      eyebrow: 'Cinema REST API',
      headline: 'Cinema data, behind the scenes.',
      caption:
        'An Express and MongoDB backend prototype for movies, theaters, screenings, news, and users.',
      features: [
        'GET, POST, PATCH, and DELETE resource routes.',
        'Mongoose models with separate Express route modules.',
      ],
    },
    'tic-tac-toe-ai': {
      eyebrow: 'Tic-Tac-Toe AI',
      headline: 'A board. A search. A move.',
      caption:
        'A Java console experiment using recursive minimax to select moves on a 4×4 board.',
      features: [
        'Human input and terminal-state evaluation.',
        'Minimum and maximum search with a visited-node counter.',
      ],
    },
    'multi-agent-search': {
      eyebrow: 'Multi-Agent Search Simulation',
      headline: 'Agents exchange messages. Strategies change.',
      caption:
        'A Java coursework simulation exploring threaded agents, private constraints, and classical game-theory strategies.',
      features: [
        'Typed coordination messages through a shared mailer.',
        "Prisoner's Dilemma and Battle of the Sexes modes.",
      ],
    },
    'maze-search': {
      eyebrow: 'Maze Search Algorithms',
      headline: 'Three searches. One maze.',
      caption:
        'A Java learning project running uniform-cost, greedy, and A* search through shared maze infrastructure.',
      features: [
        'Priority-queue frontiers with algorithm-specific comparators.',
        'Explored states, reconstructed paths, and text-file input.',
      ],
    },
  },
  he: {
    'hebrew-subtitle-studio': {
      eyebrow: 'Hebrew Subtitle Studio',
      headline: 'תרגום כתוביות. עם התזמון המקורי.',
      caption:
        'תרגום מקומי מאנגלית לעברית עם הקשר, עריכה זו לצד זו ובדיקה אנושית.',
      features: [
        'תרגום בקבוצות עם Ollama ושמירת תזמון ב-SRT וב-WebVTT.',
        'סימון שורות לבדיקה, שמירת פרויקטים והמשך תרגום.',
      ],
    },
    'esp32-claude-remote': {
      eyebrow: 'ESP32 Claude Remote',
      headline: 'גשר מחומרה לתכנות עם AI.',
      caption:
        'אב־טיפוס ESP32 טורי מתחבר לסשן Claude במחשב המארח דרך גשר WebSocket ב-Python.',
      features: [
        'העברת הנחיות, הזרמת פלט, עצירות וטיפול בהרשאות.',
        'לקוח דפדפן לבדיקת פרוטוקול הגשר המשותף.',
      ],
    },
    blaster: {
      eyebrow: 'Blaster',
      headline: 'משחק משותף מתחיל במצב מסונכרן.',
      caption:
        'אב־טיפוס ב-Unreal Engine 5 לחיפוש סשנים, הצטיידות בנשק וסנכרון כיוון.',
      features: [
        'ניהול סשנים ב-Online Subsystem שניתן לשימוש חוזר.',
        'רכיבי משחק ב-C++ עם רפליקציה וקריאות RPC לשרת.',
      ],
    },
    cinema: {
      eyebrow: 'Cinema',
      headline: 'לגלות סרטים. מהממשק עד ל-API.',
      caption:
        'אב־טיפוס שמחבר ממשק סרטים וחדשות ב-React עם API ב-Express וב-MongoDB.',
      features: [
        'קטגוריות סרטים וקרוסלה ב-React.',
        'נתיבי API נפרדים לסרטים, חדשות, בתי קולנוע והקרנות.',
      ],
    },
    'developer-portfolio': {
      eyebrow: 'תיק עבודות בפיתוח תוכנה',
      headline: 'עבודת הפיתוח, במקום אחד.',
      caption:
        'תיק עבודות ב-React וב-TypeScript שמחבר פרויקטים ציבוריים, ניסיון מקצועי וממשקים בשלוש שפות.',
      features: [
        'נתוני קורות חיים עם טיפוסים באנגלית, בעברית וביפנית.',
        'טעינת מאגרים ציבוריים לצד סיפורי פרויקטים שנכתבו ידנית.',
      ],
    },
    'flappy-bird-clone': {
      eyebrow: 'Flappy Bird Clone',
      headline: 'לעבור את המכשול. לנסות שוב.',
      caption:
        'פרויקט לימודי ב-Unity עם פיזיקת ציפור דו־ממדית, צינורות אקראיים, ניקוד והתחלה מחדש.',
      features: [
        'תנועה מבוססת Rigidbody2D וקלט מהשחקן.',
        'הצגת ניקוד, מצב סיום משחק וניווט בתפריט.',
      ],
    },
    'kitchen-chaos': {
      eyebrow: 'Kitchen Chaos',
      headline: 'להכין. לבשל. להספיק בזמן.',
      caption:
        'אב־טיפוס מטבח ב-Unity לחקר פעולות עם מרכיבים, התאמת מתכונים ומשלוחים מוגבלים בזמן.',
      features: [
        'מתכונים ב-ScriptableObjects וממשק התקדמות מבוסס אירועים.',
        'מחלקות דלפקים להכנה, בישול, צלחות ומשלוח.',
      ],
    },
    'cinema-rest-api': {
      eyebrow: 'Cinema REST API',
      headline: 'נתוני הקולנוע, מאחורי הקלעים.',
      caption:
        'אב־טיפוס שרת ב-Express וב-MongoDB לסרטים, בתי קולנוע, הקרנות, חדשות ומשתמשים.',
      features: [
        'נתיבי משאבים מסוג GET, POST, PATCH ו-DELETE.',
        'מודלי Mongoose ומודולי נתיבים נפרדים ב-Express.',
      ],
    },
    'tic-tac-toe-ai': {
      eyebrow: 'בינה מלאכותית לאיקס־עיגול',
      headline: 'לוח. חיפוש. מהלך.',
      caption:
        'התנסות במסוף ב-Java עם Minimax רקורסיבי לבחירת מהלכים על לוח 4×4.',
      features: [
        'קלט משחקן אנושי והערכת מצבי סיום.',
        'חיפוש מינימום ומקסימום עם ספירת צמתים שנבדקו.',
      ],
    },
    'multi-agent-search': {
      eyebrow: 'סימולציית חיפוש מרובה סוכנים',
      headline: 'סוכנים מתכתבים. אסטרטגיות משתנות.',
      caption:
        'סימולציה לימודית ב-Java עם סוכנים בתהליכונים, אילוצים פרטיים ואסטרטגיות מתורת המשחקים הקלאסית.',
      features: [
        'הודעות תיאום לפי סוג דרך מערכת העברת הודעות משותפת.',
        'מצבי דילמת האסיר ומלחמת המינים.',
      ],
    },
    'maze-search': {
      eyebrow: 'אלגוריתמי חיפוש במבוך',
      headline: 'שלושה חיפושים. מבוך אחד.',
      caption:
        'פרויקט לימודי ב-Java שמריץ חיפוש בעלות אחידה, חיפוש חמדני ו-A* על תשתית מבוך משותפת.',
      features: [
        'תורי עדיפויות עם משווים נפרדים לכל אלגוריתם.',
        'מעקב אחר מצבים שנבדקו, שחזור מסלולים וקלט מקובצי טקסט.',
      ],
    },
  },
  jp: {
    'hebrew-subtitle-studio': {
      eyebrow: 'Hebrew Subtitle Studio',
      headline: '字幕を翻訳。タイミングはそのまま。',
      caption:
        '文脈を踏まえた英語からヘブライ語へのローカル字幕翻訳。原文と訳文を並べ、人が編集・確認。',
      features: [
        'Ollamaでバッチ翻訳し、SRT・WebVTTのタイムスタンプを保持。',
        '確認フラグ、プロジェクト保存、翻訳の中断・再開。',
      ],
    },
    'esp32-claude-remote': {
      eyebrow: 'ESP32 Claude Remote',
      headline: 'ハードウェアから、AIコーディングへ。',
      caption:
        'ESP32のシリアル試作とホストPCのClaudeセッションを、Python WebSocketブリッジで接続。',
      features: [
        'プロンプト、出力ストリーミング、中断、権限の判断を伝達。',
        '共通のブリッジプロトコルをブラウザークライアントで検証。',
      ],
    },
    blaster: {
      eyebrow: 'Blaster',
      headline: 'マルチプレイヤーは、状態の共有から。',
      caption:
        'セッション検索、武器の装備、照準の同期を探るUnreal Engine 5のプロトタイプ。',
      features: [
        'Online Subsystemによる再利用可能なセッション管理。',
        'C++のゲームプレイ、レプリケーション、サーバーRPC。',
      ],
    },
    cinema: {
      eyebrow: 'Cinema',
      headline: '映画を探す。UIからAPIまで。',
      caption:
        'Reactの映画・ニュースUIとExpress・MongoDBのAPIを組み合わせたプロトタイプ。',
      features: [
        'Reactによる映画カテゴリーとカルーセル。',
        '映画、ニュース、劇場、上映情報の個別APIルート。',
      ],
    },
    'developer-portfolio': {
      eyebrow: '開発ポートフォリオ',
      headline: '開発の仕事を、ひとつの場所に。',
      caption:
        '公開プロジェクトと職務経験を、3言語のUIでつなぐReact・TypeScriptポートフォリオ。',
      features: [
        '型付きの履歴書データと英語・ヘブライ語・日本語のUI。',
        '公開リポジトリの取得と、人が記述したプロジェクト紹介。',
      ],
    },
    'flappy-bird-clone': {
      eyebrow: 'Flappy Bird Clone',
      headline: '障害物を抜けて、もう一度。',
      caption:
        '鳥の2D物理、ランダムなパイプ、スコア、再スタートを実装したUnityの学習プロジェクト。',
      features: [
        'Rigidbody2Dによる移動とプレイヤー入力。',
        'スコア表示、ゲーム終了、メニューへの移動。',
      ],
    },
    'kitchen-chaos': {
      eyebrow: 'Kitchen Chaos',
      headline: '準備して、調理して、時間内に届ける。',
      caption:
        '食材の操作、レシピ照合、時間制限付きの配達を探るUnityのキッチンプロトタイプ。',
      features: [
        'ScriptableObjectのレシピと、イベントで更新する進捗UI。',
        '準備、調理、皿、配達を扱う調理台のクラス構成。',
      ],
    },
    'cinema-rest-api': {
      eyebrow: 'Cinema REST API',
      headline: '映画館のデータを、舞台裏から。',
      caption:
        '映画、劇場、上映、ニュース、ユーザーを扱うExpress・MongoDBバックエンドのプロトタイプ。',
      features: [
        'GET・POST・PATCH・DELETEのリソースルート。',
        'Mongooseモデルと、個別のExpressルートモジュール。',
      ],
    },
    'tic-tac-toe-ai': {
      eyebrow: '三目並べAI',
      headline: '盤面を読み、探索し、手を選ぶ。',
      caption:
        '4×4の盤面で再帰的なミニマックス探索を試す、Javaのコンソール実験。',
      features: [
        '人間の入力と、ゲーム終了状態の評価。',
        '最小化・最大化探索と、探索済みノードのカウント。',
      ],
    },
    'multi-agent-search': {
      eyebrow: 'マルチエージェント探索',
      headline: 'メッセージから、戦略の変化へ。',
      caption:
        'スレッド型エージェント、非公開の制約、古典的なゲーム理論を探るJavaの学習シミュレーション。',
      features: [
        '共通のメール機構による型別の調整メッセージ。',
        '囚人のジレンマと男女の争いのモード。',
      ],
    },
    'maze-search': {
      eyebrow: '迷路探索アルゴリズム',
      headline: '3つの探索。ひとつの迷路。',
      caption:
        '共通の迷路基盤で一様コスト探索、貪欲探索、A*探索を実行するJavaの学習プロジェクト。',
      features: [
        'アルゴリズム別の比較器を使う優先度付きキュー。',
        '探索済み状態の追跡、経路の復元、テキストファイル入力。',
      ],
    },
  },
};

export function getProjectStoryCopy(
  language: string,
  slug: string
): ProjectStoryCopy | undefined {
  const localizedStories = stories[getCatalogLanguage(language)];
  return Object.prototype.hasOwnProperty.call(localizedStories, slug)
    ? localizedStories[slug as StorySlug]
    : undefined;
}
