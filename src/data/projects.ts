export type ProjectStation = 'product' | 'systems' | 'lab';
export type ProjectStatus = 'personal-project' | 'prototype';

export interface PortfolioProject {
  slug: string;
  station: ProjectStation;
  status: ProjectStatus;
  featured: boolean;
  title: string;
  summary: string;
  role: string;
  problem: string;
  contributions: string[];
  decisions: string[];
  limitations: string[];
  technologies: string[];
  image: string;
  imageAlt: string;
  github: string;
}

type ProjectSlug =
  | 'hebrew-subtitle-studio'
  | 'esp32-claude-remote'
  | 'blaster'
  | 'cinema';
type Language = 'en' | 'he' | 'jp';
type ProjectText = Pick<
  PortfolioProject,
  | 'title'
  | 'summary'
  | 'role'
  | 'problem'
  | 'contributions'
  | 'decisions'
  | 'limitations'
  | 'imageAlt'
>;
type ProjectMetadata = Omit<PortfolioProject, keyof ProjectText | 'slug'> & {
  slug: ProjectSlug;
};

// Curated from the public repositories, rather than ordered by GitHub activity.
// Prototype labels describe the documented state, not a deployed product.
const projects: ProjectMetadata[] = [
  {
    slug: 'hebrew-subtitle-studio',
    station: 'product',
    status: 'personal-project',
    featured: true,
    technologies: ['JavaScript', 'Node.js', 'HTML', 'CSS', 'Ollama'],
    image: '/images/projects/subtitle-studio.webp',
    github: 'https://github.com/rotembab/hebrew-subtitle-studio',
  },
  {
    slug: 'esp32-claude-remote',
    station: 'systems',
    status: 'prototype',
    featured: true,
    technologies: ['Python', 'C++', 'ESP32', 'WebSockets', 'Claude Agent SDK'],
    image: '/images/projects/esp32-architecture.svg',
    github: 'https://github.com/rotembab/esp32-claude-remote',
  },
  {
    slug: 'blaster',
    station: 'lab',
    status: 'prototype',
    featured: true,
    technologies: ['C++', 'Unreal Engine 5', 'Online Subsystem', 'Replication'],
    image: '/images/projects/blaster.webp',
    github: 'https://github.com/rotembab/Blaster--UE5-Project',
  },
  {
    slug: 'cinema',
    station: 'product',
    status: 'prototype',
    featured: false,
    technologies: ['React', 'JavaScript', 'Tailwind CSS', 'Express', 'MongoDB'],
    image: '/images/projects/cinema-architecture.svg',
    github: 'https://github.com/rotembab/cinema',
  },
];

const text: Record<Language, Record<ProjectSlug, ProjectText>> = {
  en: {
    'hebrew-subtitle-studio': {
      title: 'Hebrew Subtitle Studio',
      summary:
        'Local subtitle translation with preserved timing and a human review loop.',
      role: 'Browser interface, local server and subtitle processing',
      problem:
        'Literal translation misses idioms, dialogue context and Hebrew gender. Subtitle editing also needs to preserve the original cue timing.',
      contributions: [
        'SRT and WebVTT import, a side-by-side English/Hebrew editor and subtitle export.',
        'Context-aware translation batches through a local Ollama model, with an optional second review pass.',
        'Cancellation, resume, saved projects and editable review flags.',
      ],
      decisions: [
        'Keep inference on the local machine and validate structured model output before accepting a batch.',
        'Preserve cue identifiers, timestamps and WebVTT metadata; flag readability issues instead of truncating dialogue.',
      ],
      limitations: [
        'Requires Ollama and a suitable local model. Translation and review still need human judgment.',
        'Works with text subtitles; it does not transcribe audio or repair timing.',
      ],
      imageAlt:
        'Actual Hebrew Subtitle Studio interface with its included fictional English subtitle example loaded; translation has not started.',
    },
    'esp32-claude-remote': {
      title: 'ESP32 Claude Remote',
      summary:
        'A hardware-to-software bridge for streaming AI coding sessions. Prototype.',
      role: 'Python bridge, browser test client and serial firmware',
      problem:
        'A small ESP32 cannot run an AI coding session itself. It needs a bridge that streams output and carries prompts, interruptions and permission decisions.',
      contributions: [
        'A Python WebSocket bridge connecting remote input to a Claude Agent SDK session.',
        'A browser client for testing streaming, stop, new-session and permission-mode controls.',
        'An Arduino serial firmware smoke test and a bridge-side speech-to-text path.',
      ],
      decisions: [
        'Keep the ESP32 as a thin client; run the coding session and speech processing on the host computer.',
        'Use the same bridge protocol for browser testing and hardware input, with permission handling in the bridge.',
      ],
      limitations: [
        'The documented hardware implementation is a serial prototype. A finished screen, physical buttons, microphone and enclosure remain roadmap work.',
        'The bridge requires host setup, network access and an Anthropic API key.',
      ],
      imageAlt:
        'Prototype architecture: ESP32 serial client and browser test client connect to a Python WebSocket bridge, which runs the Claude Agent SDK.',
    },
    blaster: {
      title: 'Blaster',
      summary:
        'An Unreal Engine multiplayer prototype exploring sessions and replicated interactions.',
      role: 'C++ gameplay components and multiplayer session integration',
      problem:
        'Multiplayer interactions need shared state: players must discover and join a session, while weapon equipping and aiming stay synchronized.',
      contributions: [
        "Online session creation, discovery, joining and destruction through Unreal's Online Subsystem.",
        'Replicated equipped-weapon and aiming state, with server RPCs for player actions.',
        'Character input, camera, animation and weapon components in C++.',
      ],
      decisions: [
        'Separate session management into a reusable Unreal subsystem.',
        'Use replication and server-directed actions to communicate multiplayer state.',
      ],
      limitations: [
        'A game prototype, not a released game. The public code does not establish a completed combat loop.',
        'Requires an Unreal Engine project setup; no hosted playable build or measured multiplayer performance is provided.',
      ],
      imageAlt:
        'Gameplay preview checked into the Blaster Unreal Engine repository.',
    },
    cinema: {
      title: 'Cinema',
      summary:
        'A React movie interface paired with an Express and MongoDB API. Prototype.',
      role: 'Frontend and REST API exploration',
      problem:
        'A cinema interface needs movie and news data, with a backend model for theaters and screenings.',
      contributions: [
        'A React interface that fetches movies and news and presents a carousel and movie categories.',
        'A separate Express/Mongoose API with movie, news, theater and screening routes.',
        'A ticket-search interface scaffold with cinema and movie modes.',
      ],
      decisions: [
        'Separate the browser client from the REST API and use MongoDB models for the cinema data.',
        'Keep the API source available separately at github.com/rotembab/Cinema_REST_API.',
      ],
      limitations: [
        'The client points to localhost and ticket selectors are not populated in the public implementation.',
        'No verified public deployment, checkout or complete booking flow is provided.',
      ],
      imageAlt:
        'Cinema prototype architecture connecting a React client, an Express REST API and MongoDB models.',
    },
  },
  he: {
    'hebrew-subtitle-studio': {
      title: 'Hebrew Subtitle Studio',
      summary: 'תרגום כתוביות מקומי ששומר על התזמון ומשאיר מקום לבדיקה אנושית.',
      role: 'ממשק דפדפן, שרת מקומי ועיבוד כתוביות',
      problem:
        'תרגום מילולי מפספס ביטויים, הקשר ומגדר בעברית. עריכת כתוביות צריכה גם לשמור על התזמון המקורי.',
      contributions: [
        'ייבוא SRT ו-WebVTT, עורך אנגלית ועברית זו לצד זו וייצוא כתוביות.',
        'תרגום בקבוצות עם הקשר באמצעות מודל Ollama מקומי, עם סבב בדיקה נוסף לבחירה.',
        'עצירה, המשך תרגום, שמירת פרויקטים וסימון שורות לבדיקה ועריכה.',
      ],
      decisions: [
        'הרצת המודל במחשב המקומי ובדיקת הפלט המובנה לפני קבלת קבוצת תרגומים.',
        'שמירה על מזהים, תזמון ומטא-נתונים של WebVTT; סימון בעיות קריאות במקום קיצור אוטומטי של הדיאלוג.',
      ],
      limitations: [
        'נדרשים Ollama ומודל מקומי מתאים. התרגום והבדיקה עדיין דורשים שיקול דעת אנושי.',
        'תומך בכתוביות טקסט בלבד; אינו מתמלל אודיו או מתקן תזמון.',
      ],
      imageAlt:
        'הממשק האמיתי של Hebrew Subtitle Studio עם דוגמת הכתוביות הבדיונית המצורפת באנגלית; התרגום טרם התחיל.',
    },
    'esp32-claude-remote': {
      title: 'ESP32 Claude Remote',
      summary: 'גשר בין חומרה לתוכנה לשליטה בסשן תכנות עם AI. אב־טיפוס.',
      role: 'גשר Python, לקוח בדיקה בדפדפן וקושחה לתקשורת טורית',
      problem:
        'ESP32 קטן אינו יכול להריץ בעצמו סשן תכנות עם AI. הוא זקוק לגשר שמעביר פלט, הנחיות, עצירות והחלטות הרשאה.',
      contributions: [
        'גשר WebSocket ב-Python שמחבר קלט מרוחק לסשן Claude Agent SDK.',
        'לקוח דפדפן לבדיקת הזרמת פלט, עצירה, סשן חדש ומצבי הרשאה.',
        'קושחת Arduino לבדיקת תקשורת טורית ומסלול תמלול קול בצד הגשר.',
      ],
      decisions: [
        'השארת ESP32 כלקוח קל; סשן התכנות ועיבוד הדיבור רצים במחשב המארח.',
        'שימוש באותו פרוטוקול לגשר עבור בדיקות בדפדפן וקלט מהחומרה, עם טיפול בהרשאות בצד הגשר.',
      ],
      limitations: [
        'מימוש החומרה המתועד הוא אב־טיפוס לתקשורת טורית. מסך, כפתורים פיזיים, מיקרופון ומארז מוגמר עדיין בתכנון.',
        'הגשר דורש הגדרה במחשב, חיבור לרשת ומפתח API של Anthropic.',
      ],
      imageAlt:
        'ארכיטקטורת אב־טיפוס: לקוח ESP32 טורי ולקוח בדיקה בדפדפן מתחברים לגשר WebSocket ב-Python שמריץ Claude Agent SDK.',
    },
    blaster: {
      title: 'Blaster',
      summary:
        'אב־טיפוס מרובה משתתפים ב-Unreal Engine, לחקר סשנים וסנכרון פעולות.',
      role: 'רכיבי משחק ב-C++ ואינטגרציה של סשנים מרובי משתתפים',
      problem:
        'משחק מרובה משתתפים דורש מצב משותף: שחקנים צריכים למצוא סשן ולהצטרף אליו, תוך סנכרון הצטיידות בנשק וכיוון.',
      contributions: [
        'יצירה, חיפוש, הצטרפות וסגירה של סשנים באמצעות Online Subsystem של Unreal.',
        'סנכרון מצב הנשק והכיוון, עם קריאות RPC לשרת עבור פעולות השחקן.',
        'רכיבי קלט, מצלמה, אנימציה ונשק ב-C++.',
      ],
      decisions: [
        'הפרדת ניהול הסשנים לתת־מערכת של Unreal שניתן להשתמש בה שוב.',
        'שימוש ברפליקציה ובפעולות המופנות לשרת להעברת מצב המשחק בין המשתתפים.',
      ],
      limitations: [
        'אב־טיפוס ולא משחק שפורסם. הקוד הציבורי אינו מעיד על מערכת קרב מלאה.',
        'דורש הגדרת פרויקט Unreal Engine; אין גרסה מקוונת למשחק או מדדי ביצועים מרובי משתתפים.',
      ],
      imageAlt: 'תצוגת משחק מתוך קובץ התצוגה שבמאגר Blaster ל-Unreal Engine.',
    },
    cinema: {
      title: 'Cinema',
      summary: 'ממשק סרטים ב-React עם API ב-Express ו-MongoDB. אב־טיפוס.',
      role: 'התנסות בפיתוח Frontend ו-REST API',
      problem:
        'ממשק קולנוע צריך נתוני סרטים וחדשות, לצד מודל Backend לבתי קולנוע ולהקרנות.',
      contributions: [
        'ממשק React שמושך סרטים וחדשות ומציג קרוסלה וקטגוריות סרטים.',
        'API נפרד ב-Express ו-Mongoose עם נתיבים לסרטים, חדשות, בתי קולנוע והקרנות.',
        'שלד ממשק לחיפוש כרטיסים לפי קולנוע או סרט.',
      ],
      decisions: [
        'הפרדת לקוח הדפדפן מה-REST API ושימוש במודלי MongoDB לנתוני הקולנוע.',
        'קוד ה-API זמין בנפרד ב-github.com/rotembab/Cinema_REST_API.',
      ],
      limitations: [
        'הלקוח פונה ל-localhost, ורשימות הבחירה לכרטיסים אינן מאוכלסות במימוש הציבורי.',
        'אין פריסה ציבורית מאומתת, תשלום או תהליך הזמנה מלא.',
      ],
      imageAlt:
        'ארכיטקטורת אב־טיפוס Cinema המחברת לקוח React, REST API ב-Express ומודלי MongoDB.',
    },
  },
  jp: {
    'hebrew-subtitle-studio': {
      title: 'Hebrew Subtitle Studio',
      summary: '字幕のタイミングを保ち、人が確認できるローカル翻訳ツール。',
      role: 'ブラウザーUI、ローカルサーバー、字幕処理',
      problem:
        '直訳では慣用句、会話の文脈、ヘブライ語の性の一致を捉えきれません。字幕編集では元のタイミングも保つ必要があります。',
      contributions: [
        'SRT・WebVTTの読み込み、英語とヘブライ語を並べたエディター、字幕の書き出し。',
        'ローカルのOllamaモデルによる文脈付きバッチ翻訳と、任意の再確認処理。',
        '中断・再開、プロジェクト保存、編集可能な確認フラグ。',
      ],
      decisions: [
        'モデルをローカルで実行し、構造化された出力を検証してから翻訳結果を受け入れる。',
        '字幕ID、タイムスタンプ、WebVTTのメタデータを保持し、文章を切り詰めずに読みやすさの問題を表示する。',
      ],
      limitations: [
        'Ollamaと適切なローカルモデルが必要です。翻訳と確認には人の判断が欠かせません。',
        'テキスト字幕のみ対応。音声の文字起こしやタイミングの修正は行いません。',
      ],
      imageAlt:
        '付属の架空の英語字幕サンプルを読み込んだ実際のHebrew Subtitle Studio画面。翻訳はまだ開始していません。',
    },
    'esp32-claude-remote': {
      title: 'ESP32 Claude Remote',
      summary:
        'AIコーディングセッションをつなぐハードウェア・ソフトウェアの試作。',
      role: 'Pythonブリッジ、ブラウザーテストクライアント、シリアル通信ファームウェア',
      problem:
        '小型のESP32だけではAIコーディングセッションを実行できません。出力、プロンプト、中断、権限の判断を伝えるブリッジが必要です。',
      contributions: [
        'リモート入力をClaude Agent SDKのセッションにつなぐPython WebSocketブリッジ。',
        '出力ストリーミング、停止、新規セッション、権限モードを確認するブラウザークライアント。',
        'Arduinoのシリアル通信スモークテストと、ブリッジ側の音声認識処理。',
      ],
      decisions: [
        'ESP32を薄いクライアントに留め、コーディングセッションと音声処理はホストPCで実行する。',
        'ブラウザーテストとハードウェア入力で共通のプロトコルを使い、権限処理をブリッジに集約する。',
      ],
      limitations: [
        '公開されているハードウェア実装はシリアル通信の試作です。画面、物理ボタン、マイク、筐体の完成は今後の課題です。',
        'ホスト側の設定、ネットワーク接続、Anthropic APIキーが必要です。',
      ],
      imageAlt:
        '試作の構成図。ESP32のシリアルクライアントとブラウザーテストクライアントがPython WebSocketブリッジにつながり、Claude Agent SDKを実行します。',
    },
    blaster: {
      title: 'Blaster',
      summary:
        'セッション管理と状態同期を探るUnreal Engineのマルチプレイヤー試作。',
      role: 'C++ゲームプレイコンポーネントとマルチプレイヤーセッションの統合',
      problem:
        'マルチプレイヤーでは状態の共有が必要です。プレイヤーがセッションを検索・参加し、武器の装備と照準の状態を同期させます。',
      contributions: [
        'UnrealのOnline Subsystemによるセッションの作成、検索、参加、破棄。',
        '武器装備・照準状態のレプリケーションと、プレイヤー操作用のサーバーRPC。',
        'C++によるキャラクター入力、カメラ、アニメーション、武器のコンポーネント。',
      ],
      decisions: [
        'セッション管理を再利用可能なUnrealサブシステムとして分離する。',
        'レプリケーションとサーバーへの操作要求でマルチプレイヤーの状態を伝える。',
      ],
      limitations: [
        'リリース済みのゲームではなく試作です。公開コードからは完成した戦闘システムを確認できません。',
        'Unreal Engineのプロジェクト設定が必要です。公開プレイ用ビルドやマルチプレイヤー性能の測定値はありません。',
      ],
      imageAlt:
        'BlasterのUnreal Engineリポジトリに収録されたゲームプレイのプレビュー。',
    },
    cinema: {
      title: 'Cinema',
      summary: 'Reactの映画UIとExpress・MongoDB APIを組み合わせた試作。',
      role: 'フロントエンドとREST APIの開発実験',
      problem:
        '映画館のUIには映画・ニュースのデータと、劇場・上映情報を扱うバックエンドモデルが必要です。',
      contributions: [
        '映画とニュースを取得し、カルーセルと映画カテゴリーを表示するReact UI。',
        '映画、ニュース、劇場、上映情報のルートを持つExpress・Mongoose API。',
        '映画館別・映画別のチケット検索UIの土台。',
      ],
      decisions: [
        'ブラウザークライアントとREST APIを分離し、MongoDBのモデルで映画館のデータを扱う。',
        'APIのソースはgithub.com/rotembab/Cinema_REST_APIで個別に公開する。',
      ],
      limitations: [
        'クライアントはlocalhostに接続し、公開実装ではチケットの選択肢が未設定です。',
        '公開デプロイ、決済、完成した予約フローは確認できません。',
      ],
      imageAlt:
        'Reactクライアント、Express REST API、MongoDBモデルをつなぐCinema試作の構成図。',
    },
  },
};

export function getProjects(language: string): PortfolioProject[] {
  const code = language.toLowerCase().split(/[-_]/)[0];
  const locale: Language =
    code === 'he' ? 'he' : code === 'jp' || code === 'ja' ? 'jp' : 'en';
  return projects.map((project) => ({
    ...project,
    ...text[locale][project.slug],
  }));
}
