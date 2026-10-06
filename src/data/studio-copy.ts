import {
  getWalkthroughCopy,
  type WalkthroughCopy,
} from './subtitle-walkthrough';

export type ShowcaseView = 'interface' | 'processing' | 'review';
type Capability = 'interfaces' | 'systems' | 'delivery';

interface StudioText {
  showcaseTitle: string;
  showcaseControls: string;
  showcaseNote: string;
  reviewLabel: string;
  proof: Record<'voyager-labs' | 'izer', string>;
  caseStudy: string;
  subtitle: { problem: string; contribution: string; capabilities: string[] };
  capabilitiesTitle: string;
  capabilities: Record<Capability, { title: string; description: string }>;
  seeExperience: string;
  seeSystems: string;
  blasterMediaNote: string;
}

export interface StudioCopy extends StudioText {
  views: Record<ShowcaseView, { label: string; description: string }>;
  imageNote: string;
  imageUnavailable: string;
  diagramLabel: string;
  nodes: WalkthroughCopy['nodes'];
}

const en: StudioText = {
  showcaseTitle: 'Inside Subtitle Studio',
  showcaseControls: 'Explore Subtitle Studio',
  showcaseNote:
    'These views explain the implementation. No live translation runs here.',
  reviewLabel: 'Human review',
  proof: {
    'voyager-labs':
      'React and TypeScript features for a social intelligence platform, with cross-stack fixes in Kotlin and Java services.',
    izer: 'Order management and real-time chat for store operations. Owned features from design to deployment in a two-person team.',
  },
  caseStudy: 'Read the case study',
  subtitle: {
    problem:
      'Literal translation loses the context of a conversation. Subtitle editing also needs to preserve the original timing.',
    contribution:
      'I built a browser editor and local Node.js service that translate through Ollama, validate each batch, and leave the final wording to a person.',
    capabilities: [
      'SRT & WebVTT import',
      'Local translation',
      'Review & export',
    ],
  },
  capabilitiesTitle: 'From interface to delivery.',
  capabilities: {
    interfaces: {
      title: 'Interfaces',
      description:
        'Product features in React and TypeScript, shaped with product and design at Voyager Labs.',
    },
    systems: {
      title: 'Systems',
      description:
        'Local processing and connected clients, from Subtitle Studio to the ESP32 bridge.',
    },
    delivery: {
      title: 'Delivery',
      description:
        'Direct ownership of requirements, implementation, and deployment in IZer’s two-person development team.',
    },
  },
  seeExperience: 'See my experience',
  seeSystems: 'Explore the bridge',
  blasterMediaNote:
    'Gameplay capture from the multiplayer prototype. Open the case study for the implementation.',
};

const he: StudioText = {
  showcaseTitle: 'בתוך Subtitle Studio',
  showcaseControls: 'להכיר את Subtitle Studio',
  showcaseNote: 'התצוגות מסבירות את המימוש. לא מתבצע כאן תרגום חי.',
  reviewLabel: 'בדיקה אנושית',
  proof: {
    'voyager-labs':
      'פיתוח יכולות ב-React וב-TypeScript לפלטפורמת מודיעין רשתות חברתיות, ותיקון בעיות לאורך הסטאק בשירותי Kotlin ו-Java.',
    izer: 'ניהול הזמנות וצ׳אט בזמן אמת לתפעול חנויות. אחריות על יכולות מתכנון ועד פריסה בצוות של שני מפתחים.',
  },
  caseStudy: 'לסיפור הפרויקט',
  subtitle: {
    problem:
      'תרגום מילולי מאבד את ההקשר של השיחה. עריכת כתוביות צריכה גם לשמור על התזמון המקורי.',
    contribution:
      'בניתי עורך בדפדפן ושירות Node.js מקומי שמתרגמים דרך Ollama, מאמתים כל קבוצה ומשאירים את הניסוח הסופי לאדם.',
    capabilities: ['ייבוא SRT ו-WebVTT', 'תרגום מקומי', 'בדיקה וייצוא'],
  },
  capabilitiesTitle: 'מהממשק ועד המסירה.',
  capabilities: {
    interfaces: {
      title: 'ממשקים',
      description:
        'יכולות מוצר ב-React וב-TypeScript, בשיתוף צוותי המוצר והעיצוב ב-Voyager Labs.',
    },
    systems: {
      title: 'מערכות',
      description:
        'עיבוד מקומי ולקוחות מחוברים, מ-Subtitle Studio ועד גשר ESP32.',
    },
    delivery: {
      title: 'מסירה',
      description:
        'אחריות ישירה על דרישות, מימוש ופריסה בצוות הפיתוח של שניים ב-IZer.',
    },
  },
  seeExperience: 'לניסיון שלי',
  seeSystems: 'להכיר את הגשר',
  blasterMediaNote:
    'צילום משחק מתוך אב־הטיפוס מרובה המשתתפים. סיפור הפרויקט מסביר את המימוש.',
};

const jp: StudioText = {
  showcaseTitle: 'Subtitle Studioの仕組み',
  showcaseControls: 'Subtitle Studioを見る',
  showcaseNote: '実装を説明する表示です。ここでは実際の翻訳は実行しません。',
  reviewLabel: '人による確認',
  proof: {
    'voyager-labs':
      'ソーシャルインテリジェンス基盤のReact・TypeScript機能と、Kotlin・Javaサービスにまたがる不具合の修正。',
    izer: '店舗業務の注文管理とリアルタイムチャット。2人の開発チームで設計からデプロイまで担当しました。',
  },
  caseStudy: '開発事例を読む',
  subtitle: {
    problem:
      '直訳では会話の文脈が失われます。字幕の編集では、元のタイミングも保つ必要があります。',
    contribution:
      'ブラウザーのエディターとローカルNode.jsサービスを構築。Ollamaで翻訳し、バッチごとに検証して、最後の表現は人が確認します。',
    capabilities: ['SRT・WebVTT読み込み', 'ローカル翻訳', '確認・書き出し'],
  },
  capabilitiesTitle: 'UIからデリバリーまで。',
  capabilities: {
    interfaces: {
      title: 'インターフェース',
      description:
        'Voyager Labsでプロダクトとデザインのチームと協力し、React・TypeScriptの機能を開発。',
    },
    systems: {
      title: 'システム',
      description:
        'Subtitle Studioのローカル処理からESP32ブリッジまで、処理とクライアントを接続。',
    },
    delivery: {
      title: 'デリバリー',
      description: 'IZerの2人の開発チームで、要件、実装、デプロイを直接担当。',
    },
  },
  seeExperience: '職務経験を見る',
  seeSystems: 'ブリッジを見る',
  blasterMediaNote:
    'マルチプレイヤー試作のゲーム画面です。実装は開発事例をご覧ください。',
};

export function getStudioCopy(language: string): StudioCopy {
  const code = language.toLowerCase().split(/[-_]/)[0];
  const text = code === 'he' ? he : code === 'jp' || code === 'ja' ? jp : en;
  const walkthrough = getWalkthroughCopy(language);
  return {
    ...text,
    views: {
      interface: {
        label: walkthrough.views.interface,
        description: walkthrough.steps.review.interface,
      },
      processing: {
        label: walkthrough.steps.process.label,
        description: walkthrough.steps.process.behind,
      },
      review: {
        label: text.reviewLabel,
        description:
          walkthrough.steps.review.behind +
          ' ' +
          walkthrough.steps.export.behind,
      },
    },
    imageNote: walkthrough.imageNote,
    imageUnavailable: walkthrough.imageUnavailable,
    diagramLabel: walkthrough.diagramLabel,
    nodes: walkthrough.nodes,
  };
}
