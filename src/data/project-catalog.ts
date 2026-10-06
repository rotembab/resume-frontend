import type { IGithubRepo } from '../interfaces/github/github-fetch-repos-query';
import { getCatalogLanguage, type CatalogLanguage } from './catalog-copy';
import { getProjects, type PortfolioProject } from './projects';
import { repositorySnapshot } from './repository-snapshot';
import { newestRepositoryFirst } from './repository-order';

export interface CatalogProject {
  slug: string;
  repository: string;
  title: string;
  summary: string;
  technologies: string[];
  github: string;
  status: 'personal-project' | 'prototype' | 'learning-project' | 'repository';
  image?: string;
  imageAlt?: string;
  illustration?: 'api' | 'board' | 'agents' | 'maze' | 'code';
  curated?: PortfolioProject;
  details?: { overview: string; features: string[]; notes: string[] };
  updatedAt: string;
  createdAt: string;
}

type AuthoredText = Pick<CatalogProject, 'title' | 'summary' | 'imageAlt'> & {
  details: NonNullable<CatalogProject['details']>;
};
type AuthoredMetadata = Pick<
  CatalogProject,
  'slug' | 'technologies' | 'status' | 'image' | 'illustration'
>;

// These descriptions are grounded in the public source. Learning projects and
// unfinished prototypes keep their documented status; no demo or metrics are inferred.
const authored = {
  'resume-frontend': {
    slug: 'developer-portfolio',
    technologies: ['React', 'TypeScript', 'Material UI', 'Vite'],
    status: 'personal-project',
    image: '/images/projects/developer-portfolio.webp',
  },
  flappybirdclone: {
    slug: 'flappy-bird-clone',
    technologies: ['Unity', 'C#', 'Input System', 'TextMesh Pro'],
    status: 'learning-project',
    image: '/images/projects/flappy-bird.webp',
  },
  kitchenchaos: {
    slug: 'kitchen-chaos',
    technologies: [
      'Unity',
      'C#',
      'ScriptableObjects',
      'Netcode for GameObjects',
    ],
    status: 'prototype',
    image: '/images/projects/kitchen-chaos.webp',
  },
  cinema_rest_api: {
    slug: 'cinema-rest-api',
    technologies: ['JavaScript', 'Node.js', 'Express', 'MongoDB', 'Mongoose'],
    status: 'prototype',
    illustration: 'api',
  },
  oac_ai_tiv_tac_toe: {
    slug: 'tic-tac-toe-ai',
    technologies: ['Java', 'Minimax', 'Game Search'],
    status: 'learning-project',
    illustration: 'board',
  },
  masp2_oac: {
    slug: 'multi-agent-search',
    technologies: ['Java', 'Threads', 'Multi-Agent Systems', 'Game Theory'],
    status: 'learning-project',
    illustration: 'agents',
  },
  aimazesearchproject_oac: {
    slug: 'maze-search',
    technologies: ['Java', 'A*', 'Uniform-Cost Search', 'Greedy Search'],
    status: 'learning-project',
    illustration: 'maze',
  },
} satisfies Record<string, AuthoredMetadata>;

type AuthoredRepository = keyof typeof authored;

const text: Record<
  CatalogLanguage,
  Record<AuthoredRepository, AuthoredText>
> = {
  en: {
    'resume-frontend': {
      title: 'Developer Portfolio',
      summary:
        'A multilingual portfolio connecting my software projects, experience, and tools.',
      imageAlt: "Rotem Babani's developer portfolio interface.",
      details: {
        overview:
          'A personal React and TypeScript site that brings my public development work and professional background into one place.',
        features: [
          'Typed resume content with English, Hebrew, and Japanese interfaces.',
          'Reusable page components for projects, experience, skills, and contact.',
          'Public GitHub repository discovery alongside authored project descriptions.',
        ],
        notes: [
          'A personal portfolio. Repository activity and project descriptions are separate sources of information.',
        ],
      },
    },
    flappybirdclone: {
      title: 'Flappy Bird Clone',
      summary:
        'A Unity learning project exploring a familiar obstacle, scoring, and restart loop.',
      imageAlt:
        'Main menu of the Flappy Bird Clone, with Play and Quit controls.',
      details: {
        overview:
          'A starter Unity game that recreates the core loop of Flappy Bird through small gameplay components.',
        features: [
          'Rigidbody2D-based bird movement and player input.',
          'Randomized pipe spawning and obstacle movement.',
          'Score display, game-over state, restart, and main-menu navigation.',
        ],
        notes: [
          'A learning project. The preview shows the checked-in main menu; no hosted playable build is provided.',
        ],
      },
    },
    kitchenchaos: {
      title: 'Kitchen Chaos',
      summary:
        'An Overcooked-inspired Unity prototype built around preparation stations and timed recipe deliveries.',
      imageAlt:
        'Kitchen Chaos gameplay preview showing preparation counters, recipe requests, and the player.',
      details: {
        overview:
          'A kitchen-management game prototype exploring ingredient interactions, recipe matching, and a timed gameplay session.',
        features: [
          'A counter interaction hierarchy for preparation, cooking, plates, and delivery.',
          'ScriptableObject ingredient and recipe data, with events driving recipe and progress UI.',
          'Netcode foundations including server-RPC player movement.',
        ],
        notes: [
          'A prototype. The public code contains networking work, but a completed multiplayer game or released build is not established.',
        ],
      },
    },
    cinema_rest_api: {
      title: 'Cinema REST API',
      summary:
        'An Express and MongoDB API for movies, theaters, screenings, news, and users.',
      details: {
        overview:
          'The separate Node.js backend for the Cinema project, organized around cinema resources and MongoDB-backed models.',
        features: [
          'Express GET, POST, PATCH, and DELETE routes for five resource groups.',
          'Mongoose models for movies, theaters, screenings, news, and users.',
          'Separate route modules with CORS and environment-based configuration.',
        ],
        notes: [
          'A backend prototype. The public repository does not provide a verified deployment, authentication flow, or complete booking system.',
        ],
      },
    },
    oac_ai_tiv_tac_toe: {
      title: 'Tic-Tac-Toe AI',
      summary:
        'A console-based 4×4 game exploring recursive minimax decisions in Java.',
      details: {
        overview:
          'A coursework game-search experiment with a human player, a computer opponent, and terminal-state evaluation on a 4×4 board.',
        features: [
          'Console board rendering and player move input.',
          'Recursive minimum and maximum search for computer move selection.',
          'A visited-node counter and optional initial board positions.',
        ],
        notes: [
          'A learning experiment. No verified optimal-play results, benchmark, or graphical application is provided.',
        ],
      },
    },
    masp2_oac: {
      title: 'Multi-Agent Search Simulation',
      summary:
        'Java agents exchanging messages and adjusting strategies in game-theory simulations.',
      details: {
        overview:
          'A multi-agent problem-solving assignment using classical game theory, threaded agents, and private pairwise constraint information.',
        features: [
          'Threaded agents with a mailer and typed coordination messages.',
          "Prisoner's Dilemma and Battle of the Sexes simulation modes.",
          'Repeated simulations with aggregate welfare and iteration reporting.',
        ],
        notes: [
          'A coursework simulation of classical agents. This project does not use large language models, and no measured production performance is claimed.',
        ],
      },
    },
    aimazesearchproject_oac: {
      title: 'Maze Search Algorithms',
      summary:
        'A Java maze-search project comparing uniform-cost, greedy, and A* search.',
      details: {
        overview:
          'A search-algorithms assignment that runs three frontier-ordering strategies through shared maze and path infrastructure.',
        features: [
          'A priority-queue frontier with algorithm-specific comparators.',
          'Explored-state tracking, path reconstruction, and solution output.',
          'Text-file maze input, including a checked-in 10×10 example.',
        ],
        notes: [
          'A learning project. The diagram is a technical illustration; no interactive browser demo or benchmark results are provided.',
        ],
      },
    },
  },
  he: {
    'resume-frontend': {
      title: 'תיק עבודות בפיתוח תוכנה',
      summary: 'תיק עבודות רב־לשוני שמחבר בין הפרויקטים, הניסיון והכלים שלי.',
      imageAlt: 'ממשק תיק העבודות של רותם בבני בפיתוח תוכנה.',
      details: {
        overview:
          'אתר אישי ב-React ו-TypeScript שמרכז את עבודות הפיתוח הציבוריות שלי ואת הרקע המקצועי שלי.',
        features: [
          'נתוני קורות חיים עם טיפוסים וממשקים באנגלית, בעברית וביפנית.',
          'רכיבי דפים לשימוש חוזר עבור פרויקטים, ניסיון, כלים ויצירת קשר.',
          'טעינת מאגרי GitHub ציבוריים לצד תיאורי פרויקטים שנכתבו ידנית.',
        ],
        notes: [
          'תיק עבודות אישי. פעילות במאגר ותיאור הפרויקט הם מקורות מידע נפרדים.',
        ],
      },
    },
    flappybirdclone: {
      title: 'Flappy Bird Clone',
      summary:
        'פרויקט לימודי ב-Unity לחקר מכשולים, צבירת נקודות והתחלת משחק מחדש.',
      imageAlt: 'התפריט הראשי של Flappy Bird Clone, עם כפתורי משחק ויציאה.',
      details: {
        overview:
          'משחק התחלתי ב-Unity שמשחזר את לולאת המשחק של Flappy Bird בעזרת רכיבי משחק קטנים.',
        features: [
          'תנועת ציפור מבוססת Rigidbody2D וקלט מהשחקן.',
          'יצירת צינורות במיקומים אקראיים ותנועת מכשולים.',
          'הצגת ניקוד, מצב סיום משחק, התחלה מחדש וחזרה לתפריט.',
        ],
        notes: [
          'פרויקט לימודי. התמונה מציגה את התפריט שבמאגר; אין גרסת משחק מקוונת.',
        ],
      },
    },
    kitchenchaos: {
      title: 'Kitchen Chaos',
      summary:
        'אב־טיפוס ב-Unity בהשראת Overcooked, עם תחנות הכנה ומשלוח מתכונים בזמן.',
      imageAlt:
        'תצוגת משחק Kitchen Chaos עם דלפקי הכנה, הזמנות מתכונים והשחקן.',
      details: {
        overview:
          'אב־טיפוס למשחק ניהול מטבח שחוקר פעולות עם מרכיבים, התאמת מתכונים וסבב משחק מוגבל בזמן.',
        features: [
          'היררכיית דלפקים לפעולות הכנה, בישול, צלחות ומשלוח.',
          'נתוני מרכיבים ומתכונים ב-ScriptableObjects, ואירועים שמעדכנים את הממשק.',
          'יסודות תקשורת Netcode, כולל תנועת שחקן בקריאות RPC לשרת.',
        ],
        notes: [
          'אב־טיפוס. הקוד הציבורי כולל עבודת רשת, אך אינו מעיד על משחק מרובה משתתפים מוגמר או גרסה שפורסמה.',
        ],
      },
    },
    cinema_rest_api: {
      title: 'Cinema REST API',
      summary:
        'API ב-Express ו-MongoDB לסרטים, בתי קולנוע, הקרנות, חדשות ומשתמשים.',
      details: {
        overview:
          'שרת Node.js נפרד לפרויקט Cinema, המאורגן לפי משאבי קולנוע ומודלים ב-MongoDB.',
        features: [
          'נתיבי GET, POST, PATCH ו-DELETE ב-Express לחמש קבוצות משאבים.',
          'מודלי Mongoose לסרטים, בתי קולנוע, הקרנות, חדשות ומשתמשים.',
          'מודולי נתיבים נפרדים, CORS והגדרות באמצעות משתני סביבה.',
        ],
        notes: [
          'אב־טיפוס לשרת. המאגר הציבורי אינו מספק פריסה מאומתת, תהליך הזדהות או מערכת הזמנות מלאה.',
        ],
      },
    },
    oac_ai_tiv_tac_toe: {
      title: 'בינה מלאכותית לאיקס־עיגול',
      summary: 'משחק 4×4 במסוף לחקר החלטות Minimax רקורסיביות ב-Java.',
      details: {
        overview:
          'התנסות לימודית בחיפוש במשחקים, עם שחקן אנושי, יריב ממוחשב והערכת מצבי סיום בלוח 4×4.',
        features: [
          'הצגת הלוח במסוף וקבלת מהלכים מהשחקן.',
          'חיפוש מינימום ומקסימום רקורסיבי לבחירת מהלך המחשב.',
          'ספירת צמתים שנבדקו ואפשרות להגדרת מצב לוח התחלתי.',
        ],
        notes: [
          'התנסות לימודית. אין תוצאות מאומתות של משחק מיטבי, מדדי ביצועים או ממשק גרפי.',
        ],
      },
    },
    masp2_oac: {
      title: 'סימולציית חיפוש מרובה סוכנים',
      summary:
        'סוכנים ב-Java שמחליפים הודעות ומשנים אסטרטגיות בסימולציות מתורת המשחקים.',
      details: {
        overview:
          'מטלה בפתרון בעיות מרובה סוכנים, עם תורת משחקים קלאסית, תהליכונים ומידע פרטי על אילוצים בין זוגות סוכנים.',
        features: [
          'סוכנים בתהליכונים עם מערכת העברת הודעות והודעות תיאום לפי סוג.',
          'מצבי סימולציה של דילמת האסיר ומלחמת המינים.',
          'סימולציות חוזרות עם דיווח על רווחה מצטברת ומספר סבבים.',
        ],
        notes: [
          'סימולציה לימודית של סוכנים קלאסיים. הפרויקט אינו משתמש במודלי שפה ואינו מציג מדדי ביצועים למערכת ייצור.',
        ],
      },
    },
    aimazesearchproject_oac: {
      title: 'אלגוריתמי חיפוש במבוך',
      summary:
        'פרויקט חיפוש במבוך ב-Java שמשווה חיפוש בעלות אחידה, חיפוש חמדני ו-A*.',
      details: {
        overview:
          'מטלה באלגוריתמי חיפוש שמריצה שלוש אסטרטגיות סדר עדיפויות על תשתית משותפת של מבוך ומסלולים.',
        features: [
          'תור עדיפויות עם משווים נפרדים לכל אלגוריתם.',
          'מעקב אחר מצבים שנבדקו, שחזור מסלול ופלט פתרון.',
          'קלט מבוך מקובץ טקסט, כולל דוגמת 10×10 במאגר.',
        ],
        notes: [
          'פרויקט לימודי. התרשים הוא איור טכני; אין הדגמה אינטראקטיבית בדפדפן או מדדי ביצועים.',
        ],
      },
    },
  },
  jp: {
    'resume-frontend': {
      title: '開発ポートフォリオ',
      summary: 'ソフトウェアの制作物、経験、技術をつなぐ多言語ポートフォリオ。',
      imageAlt: 'Rotem Babaniの開発ポートフォリオの画面。',
      details: {
        overview:
          '公開している開発プロジェクトと職務経験をまとめた、ReactとTypeScriptによる個人サイトです。',
        features: [
          '型付きの履歴書データと、英語・ヘブライ語・日本語のインターフェース。',
          'プロジェクト、経験、技術、連絡先の再利用可能なページコンポーネント。',
          'GitHubの公開リポジトリ取得と、人が記述したプロジェクト説明の併用。',
        ],
        notes: [
          '個人ポートフォリオです。リポジトリの活動とプロジェクトの説明は別の情報源です。',
        ],
      },
    },
    flappybirdclone: {
      title: 'Flappy Bird Clone',
      summary:
        '障害物、スコア、再スタートの流れを探るUnityの学習プロジェクト。',
      imageAlt: 'PlayとQuitボタンがあるFlappy Bird Cloneのメインメニュー。',
      details: {
        overview:
          '小さなゲームコンポーネントを組み合わせ、Flappy Birdの基本的なループを再現するUnityの入門ゲームです。',
        features: [
          'Rigidbody2Dによる鳥の移動とプレイヤー入力。',
          'ランダムな位置へのパイプ生成と障害物の移動。',
          'スコア表示、ゲーム終了、再スタート、メインメニューへの移動。',
        ],
        notes: [
          '学習プロジェクトです。画像はリポジトリ内のメニュー画面で、公開プレイ用ビルドはありません。',
        ],
      },
    },
    kitchenchaos: {
      title: 'Kitchen Chaos',
      summary:
        '調理台と時間制限付きの注文処理を探る、Overcookedに着想を得たUnityの試作。',
      imageAlt:
        '調理台、注文レシピ、プレイヤーを表示したKitchen Chaosのゲーム画面。',
      details: {
        overview:
          '食材の操作、レシピの照合、制限時間のあるゲーム進行を探るキッチン管理ゲームの試作です。',
        features: [
          '準備、調理、皿、配達の操作を扱う調理台のクラス構成。',
          'ScriptableObjectの食材・レシピデータと、イベントで更新するUI。',
          'サーバーRPCによるプレイヤー移動を含むNetcodeの基盤。',
        ],
        notes: [
          '試作です。公開コードにはネットワーク機能の作業がありますが、完成したマルチプレイヤーゲームやリリース済みビルドは確認できません。',
        ],
      },
    },
    cinema_rest_api: {
      title: 'Cinema REST API',
      summary:
        '映画、劇場、上映、ニュース、ユーザーを扱うExpressとMongoDBのAPI。',
      details: {
        overview:
          'Cinemaプロジェクトの独立したNode.jsバックエンドです。映画館のリソースとMongoDBのモデルを中心に構成しています。',
        features: [
          '5種類のリソースを扱うExpressのGET・POST・PATCH・DELETEルート。',
          '映画、劇場、上映、ニュース、ユーザーのMongooseモデル。',
          'ルートモジュールの分離、CORS、環境変数による設定。',
        ],
        notes: [
          'バックエンドの試作です。公開リポジトリからはデプロイ、認証フロー、完成した予約システムを確認できません。',
        ],
      },
    },
    oac_ai_tiv_tac_toe: {
      title: '三目並べAI',
      summary:
        'Javaの再帰的なミニマックス探索を試す、コンソール上の4×4ゲーム。',
      details: {
        overview:
          '人間とコンピューターが対戦し、4×4の盤面の終了状態を評価する、ゲーム探索の課題です。',
        features: [
          'コンソールの盤面表示とプレイヤーの入力。',
          'コンピューターの手を選ぶ再帰的な最小化・最大化探索。',
          '探索ノードのカウントと、初期盤面の指定。',
        ],
        notes: [
          '学習実験です。最適なプレイの検証結果、ベンチマーク、グラフィカルなアプリは提供していません。',
        ],
      },
    },
    masp2_oac: {
      title: 'マルチエージェント探索',
      summary:
        'メッセージ交換と戦略の変更を行うJavaエージェントのゲーム理論シミュレーション。',
      details: {
        overview:
          '古典的なゲーム理論、スレッドで動くエージェント、エージェント間の非公開の制約情報を使った課題です。',
        features: [
          'メール機構と型別の調整メッセージを使うスレッド型エージェント。',
          '囚人のジレンマと男女の争いのシミュレーションモード。',
          '繰り返し実験と、合計利得・反復回数の出力。',
        ],
        notes: [
          '古典的なエージェントの学習用シミュレーションです。大規模言語モデルは使用せず、本番環境の性能値は示していません。',
        ],
      },
    },
    aimazesearchproject_oac: {
      title: '迷路探索アルゴリズム',
      summary:
        '一様コスト探索、貪欲探索、A*探索を比較するJavaの迷路探索プロジェクト。',
      details: {
        overview:
          '迷路と経路の共通基盤を使い、探索候補の優先順位を決める3つの戦略を実行する課題です。',
        features: [
          'アルゴリズム別の比較器を使う優先度付きキュー。',
          '探索済み状態の追跡、経路の復元、解の出力。',
          'テキストファイルからの迷路入力と、10×10のサンプル。',
        ],
        notes: [
          '学習プロジェクトです。図は技術的な説明用で、ブラウザー上の対話デモやベンチマーク結果はありません。',
        ],
      },
    },
  },
};

function repositoryIdentity(url: string): string {
  return url
    .toLowerCase()
    .replace(/\/$/, '')
    .replace(/\.git$/, '');
}

// GitHub IDs survive repository renames. Keep authored routes and narratives
// attached to those IDs while displaying the current API name and source URL.
const knownRepositories = new Map(
  repositorySnapshot.map((repository) => [repository.id, repository])
);

export function getProjectCatalog(
  language: string,
  repositories?: IGithubRepo[]
): CatalogProject[] {
  const locale = getCatalogLanguage(language);
  const curated = new Map(
    getProjects(language).map((project) => [
      repositoryIdentity(project.github),
      project,
    ])
  );
  const completeRepositories = new Map<number, IGithubRepo>();
  for (const repository of repositories ?? repositorySnapshot) {
    if (!completeRepositories.has(repository.id)) {
      completeRepositories.set(repository.id, repository);
    }
  }

  return [...completeRepositories.values()]
    .sort(newestRepositoryFirst)
    .map((repository) => {
      const knownRepository = knownRepositories.get(repository.id);
      const identity = repositoryIdentity(
        knownRepository?.html_url ?? repository.html_url
      );
      const existing = curated.get(identity);
      const base = {
        repository: repository.name,
        github: repository.html_url,
        updatedAt: repository.updated_at,
        createdAt: repository.created_at,
      };
      if (existing) {
        return {
          ...base,
          slug: existing.slug,
          title: existing.title,
          summary: existing.summary,
          technologies: [...existing.technologies],
          status: existing.status,
          image: existing.image,
          imageAlt: existing.imageAlt,
          curated: { ...existing, github: repository.html_url },
        };
      }

      const name = (knownRepository?.name ?? repository.name).toLowerCase();
      const hasAuthoredIdentity =
        identity === `https://github.com/rotembab/${name}`;
      if (
        hasAuthoredIdentity &&
        Object.prototype.hasOwnProperty.call(authored, name)
      ) {
        const key = name as AuthoredRepository;
        const metadata = authored[key];
        return {
          ...base,
          ...metadata,
          technologies: [...metadata.technologies],
          ...text[locale][key],
        };
      }

      const summary =
        repository.description?.trim() ||
        {
          en: 'A public source repository. Explore the code on GitHub.',
          he: 'מאגר קוד ציבורי. קוד המקור זמין ב-GitHub.',
          jp: '公開ソースリポジトリ。コードはGitHubで確認できます。',
        }[locale];
      return {
        ...base,
        slug: `repository-${repository.id}`,
        title: repository.name,
        summary,
        technologies: repository.language ? [repository.language] : [],
        status: 'repository' as const,
        illustration: 'code' as const,
      };
    });
}
