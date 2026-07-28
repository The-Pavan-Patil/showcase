import { portfolioContent as en } from "./portfolio";
import type {
  ExperienceItem,
  PortfolioContent,
  ProjectCaseStudy,
  ProjectMetric,
  SocialLink,
} from "../src/lib/portfolio-types";
import type { Locale } from "../src/lib/i18n";

type ProjectTranslation = Pick<
  ProjectCaseStudy,
  | "kicker"
  | "cardHeadline"
  | "summary"
  | "role"
  | "experienceContext"
  | "challenge"
  | "approach"
  | "outcome"
  | "contributions"
  | "metrics"
  | "visualLabel"
> & {
  media?: {
    alt: string;
    caption?: string;
  };
};

const jaProjectTranslations: Record<string, ProjectTranslation> = {
  nudge: {
    kicker: "オフライン優先のソーシャルタスク",
    cardHeadline:
      "シンプルなタスクアプリの下に、オフライン優先の共同作業を支える仕組みを作りました。",
    summary:
      "Nudgeは、何度も一緒に予定を立てるグループ向けの軽いソーシャルタスク体験です。表面はシンプルなジェスチャー操作で、裏側はローカル優先の同期設計になっています。",
    role: "フルスタック開発者",
    experienceContext: "Ownpath · 2025年11月 - 現在",
    challenge:
      "アプリはすぐに動くシンプルな体験にする必要がありました。一方で、ローカル保存、ネットワーク状態、ユーザーの役割、タスクの状態、RLS、Storage、リモート同期が安全な操作に影響していました。",
    approach:
      "PowerSyncとSupabaseでローカル優先のタスクフローを作りました。リモート確認を待つ前にタスクをローカルに作成し、リモート側で利用できる状態になってから参加者を書き込みました。役割と同期の境界はサービス層で管理しました。",
    outcome:
      "テスト版と社内デモ版まで進み、ローカルからSupabaseへの安定したタスク同期、役割に応じたジェスチャー、参加者ごとの表示、通知、画像、同期ずれを戻すためのツールを実装しました。",
    contributions: [
      "ローカル優先のタスク作成とPowerSyncからSupabaseへの同期フローを設計しました。",
      "ジェスチャーを実際の権限につなげるowner/nudgerの参加者モデルを作りました。",
      "Supabase Auth、RLS、Storage、ローカルスキーマ、同期ルールをタスクと添付ファイルの流れに合わせました。",
      "スキーマ確認、クリーンスタート、リセット、ローカル挿入、同期シミュレーションのデバッグツールを作りました。",
    ],
    metrics: [
      { value: "Local-first", label: "通信確認前のタスク作成" },
      { value: "2 roles", label: "ownerとnudgerの協力モデル" },
      { value: "4 gestures", label: "完了、延期、通知、アーカイブ" },
    ],
    media: {
      alt: "オフライン同期と共同作業の構成につながるNudgeのモバイルタスク画面",
      caption: "オフライン優先のタスクUI、同期フロー、共同作業モデル",
    },
    visualLabel:
      "役割に応じたジェスチャー、オフラインキュー、Supabase同期を示すNudgeのタスク画面",
  },
  "philips-greenheart": {
    kicker: "グローバルWeb体験",
    cardHeadline: "Figmaから本番向けの多言語Webサイトを実装しました。",
    summary:
      "Figmaデザインをもとに作ったReactとTypeScriptの企業サイトです。地域別のローカライズ、ユニットテスト、アプリケーション性能監視を含みます。",
    role: "ソフトウェアエンジニア",
    experienceContext: "Ownpath · 2025年11月 - 現在",
    challenge:
      "承認済みのFigmaデザインを、地域別コンテンツを配信でき、実行時の性能も確認できる信頼性の高いWebサイトに変える必要がありました。",
    approach:
      "React、TypeScript、Tailwind CSSでUIを実装しました。標準的なi18nフローでローカライズを加え、ユニットテストとアプリケーション性能監視も導入しました。",
    outcome:
      "本番で使えるコンポーネント、多言語コンテンツ対応、自動ユニットテスト、リアルタイム性能監視を含む形で納品しました。",
    contributions: [
      "Figma仕様を再利用しやすい本番用コンポーネントに変換しました。",
      "地域別の多言語コンテンツ配信を実装しました。",
      "ユニットテストとアプリケーション性能監視を追加しました。",
    ],
    metrics: [
      { value: "Figma → code", label: "本番向け実装" },
      { value: "Multilingual", label: "ローカライズ対応" },
      { value: "Tested + monitored", label: "品質の確認" },
    ],
    visualLabel: "多言語対応と監視を備えた企業サイトを表すブラウザ構成",
  },
  "workforce-management-system": {
    kicker: "業務管理プラットフォーム",
    cardHeadline: "1,000件以上の作業員記録を扱う人員管理システム。",
    summary:
      "複数の建設現場にまたがる勤怠、設定可能な残業給与、労務、現場、ポートフォリオ業務のためのフルスタック基盤です。AWSにデプロイしました。",
    role: "フルスタック開発者",
    experienceContext: "Sonai · 2025年2月 - 10月",
    challenge:
      "会社は、複数の建設現場で作業員記録、勤怠、現場情報、設定可能な残業給与を管理する必要がありました。",
    approach:
      "React、TypeScript、Node.js、MongoDBでアプリを作りました。認証とREST APIを実装し、残業計算とExcel出力を加え、AWSへデプロイしました。",
    outcome:
      "このプラットフォームにより、1,000件以上の作業員記録を効率よく追跡できるようになりました。手作業だった給与処理の一部も、設定可能な計算と出力に置き換えました。",
    contributions: [
      "複数現場にまたがる勤怠と作業員記録のフローを作りました。",
      "設定可能な残業計算とExcel出力を自動化しました。",
      "認証付きREST APIを実装し、AWS環境を運用しました。",
    ],
    metrics: [
      { value: "1,000+", label: "作業員記録" },
      { value: "Multi-site", label: "建設現場の業務" },
      { value: "AWS", label: "デプロイ済み基盤" },
    ],
    visualLabel: "作業員、勤怠、給与フローを示す業務ダッシュボード",
  },
};

const deProjectTranslations: Record<string, ProjectTranslation> = {
  nudge: {
    kicker: "Offline-first Social Tasks",
    cardHeadline:
      "Eine einfache Aufgaben-App mit Offline-first-Zusammenarbeit im Hintergrund.",
    summary:
      "Nudge ist ein leichtes soziales Aufgabenerlebnis für Gruppen, die wiederholt gemeinsam planen. Die Oberfläche bleibt einfach, darunter arbeitet eine lokal-first Synchronisationsarchitektur.",
    role: "Full-Stack-Entwickler",
    experienceContext: "Ownpath · Nov. 2025 - heute",
    challenge:
      "Die App sollte sofort und einfach wirken. Gleichzeitig beeinflussten lokaler Speicher, Netzwerkstatus, Nutzerrollen, Aufgabenstatus, RLS, Storage-Zugriff und Remote-Synchronisierung, was sicher möglich war.",
    approach:
      "Ich baute einen lokal-first Aufgabenfluss mit PowerSync und Supabase. Aufgaben wurden lokal erstellt, bevor die Remote-Bestätigung da war. Teilnehmerdaten wurden erst geschrieben, wenn der Remote-Datensatz verfügbar war. Rollen und Sync-Grenzen blieben in der Service-Schicht.",
    outcome:
      "Das Projekt erreichte Test- und interne Demo-Builds mit stabiler Synchronisierung von lokal nach Supabase, rollenbewussten Gesten, teilnehmerbezogener Sichtbarkeit, Benachrichtigungen, Bildern und Werkzeugen zur Wiederherstellung bei Sync-Abweichungen.",
    contributions: [
      "Den lokal-first Aufgabenfluss und die Synchronisierung von PowerSync zu Supabase entworfen.",
      "Das Owner/Nudger-Modell gebaut, das Gesten mit echten Berechtigungen verbindet.",
      "Supabase Auth, RLS, Storage, lokales Schema und Sync-Regeln für Aufgaben und Anhänge abgestimmt.",
      "Werkzeuge für Schema-Prüfung, Clean Start, Reset, lokale Inserts und Sync-Simulationen erstellt.",
    ],
    metrics: [
      { value: "Local-first", label: "Aufgaben vor Netzwerkbestätigung" },
      { value: "2 roles", label: "Owner- und Nudger-Modell" },
      { value: "4 gestures", label: "erledigen, verschieben, erinnern, archivieren" },
    ],
    media: {
      alt: "Ein mobiles Nudge-Aufgabendeck verbunden mit Offline-Sync und Kollaborationsarchitektur",
      caption: "Offline-first Aufgaben-UI, Sync-Fluss und Kollaborationsmodell",
    },
    visualLabel:
      "Nudge-Aufgabendeck mit rollenbewussten Gesten, Offline-Warteschlange und Supabase-Synchronisierung",
  },
  "philips-greenheart": {
    kicker: "Globales Web-Erlebnis",
    cardHeadline: "Eine produktionsreife mehrsprachige Website aus Figma.",
    summary:
      "Eine Corporate Website mit React und TypeScript, umgesetzt aus Figma-Designs, mit regionaler Lokalisierung, Unit-Tests und Application Performance Monitoring.",
    role: "Softwareentwickler",
    experienceContext: "Ownpath · Nov. 2025 - heute",
    challenge:
      "Freigegebene Figma-Designs mussten in eine zuverlässige Website überführt werden, die regionale Inhalte ausliefert und Laufzeit-Performance sichtbar macht.",
    approach:
      "Ich baute die Oberfläche mit React, TypeScript und Tailwind CSS, ergänzte Lokalisierung über einen etablierten i18n-Workflow und implementierte Unit-Tests sowie Application Performance Monitoring.",
    outcome:
      "Die Lieferung umfasste produktionsreife Komponenten, mehrsprachige Inhalte, automatisierte Unit-Tests und Echtzeit-Performance-Monitoring.",
    contributions: [
      "Figma-Spezifikationen in wiederverwendbare Produktionskomponenten übersetzt.",
      "Regionale mehrsprachige Content-Auslieferung implementiert.",
      "Unit-Test-Abdeckung und Application Performance Monitoring ergänzt.",
    ],
    metrics: [
      { value: "Figma → code", label: "Produktionslieferung" },
      { value: "Multilingual", label: "lokalisierte Inhalte" },
      { value: "Tested + monitored", label: "Qualitätssignale" },
    ],
    visualLabel:
      "Abstrakte Browser-Komposition für eine mehrsprachige, überwachte Corporate Website",
  },
  "workforce-management-system": {
    kicker: "Operations-Plattform",
    cardHeadline: "Workforce Operations für mehr als 1.000 Mitarbeiterdatensätze.",
    summary:
      "Eine Full-Stack-Plattform für Anwesenheit, konfigurierbare Überstundenabrechnung, Arbeitskräfte, Standorte und Portfolio-Workflows über mehrere Baustellen hinweg, bereitgestellt auf AWS.",
    role: "Full-Stack-Entwickler",
    experienceContext: "Sonai · Feb. - Okt. 2025",
    challenge:
      "Das Unternehmen musste Mitarbeiterdaten, Anwesenheit, Standorte und konfigurierbare Überstundenabrechnung über mehrere Baustellen hinweg verwalten.",
    approach:
      "Ich baute die Anwendung mit React, TypeScript, Node.js und MongoDB, entwickelte Authentifizierung und REST APIs, ergänzte Überstundenberechnung sowie Excel-Export und stellte das System auf AWS bereit.",
    outcome:
      "Die Plattform unterstützt die effiziente Verwaltung von mehr als 1.000 Mitarbeiterdatensätzen und ersetzt Teile manueller Lohnprozesse durch konfigurierbare Berechnungen und Exporte.",
    contributions: [
      "Anwesenheits- und Mitarbeitenden-Workflows über mehrere Standorte gebaut.",
      "Konfigurierbare Überstundenberechnungen und Excel-Exporte automatisiert.",
      "Authentifizierte REST APIs implementiert und das AWS-Deployment betreut.",
    ],
    metrics: [
      { value: "1,000+", label: "Mitarbeiterdatensätze" },
      { value: "Multi-site", label: "Baustellenbetrieb" },
      { value: "AWS", label: "bereitgestellte Infrastruktur" },
    ],
    visualLabel:
      "Abstraktes Operations-Dashboard mit Mitarbeitenden-, Anwesenheits- und Lohn-Workflows",
  },
};

function localizeProjects(translations: Record<string, ProjectTranslation>): ProjectCaseStudy[] {
  return en.projects.map((project) => {
    const translation = translations[project.slug];

    return {
      ...project,
      ...translation,
      technologies: [...project.technologies],
      media: project.media
        ? {
            ...project.media,
            ...translation.media,
          }
        : undefined,
      caseStudy: undefined,
    };
  });
}

const jaExperience: ExperienceItem[] = [
  {
    ...en.experience[0],
    role: "ソフトウェアエンジニア",
    period: "2025年11月 - 現在",
    location: "バンガロール",
    description:
      "エンタープライズクライアント向けに、本番用のWeb・モバイルアプリを開発しています。デザインシステム文書、多言語企業サイト、オフライン優先の共同作業フローなどを担当しています。",
    projects: [
      {
        ...en.experience[0].projects![0],
        description:
          "Gitベースのデザインシステム文書プラットフォームを作りました。ブランチ共同作業、Pull Requestレビュー、RBAC権限、変更不可の公開、TipTap編集、IndexedDBキャッシュ、自動保存、楽観的同時実行制御、AIによるデザイン準拠分析を含みます。",
      },
      {
        ...en.experience[0].projects![1],
        description:
          "Figmaデザインから企業サイトを開発しました。本番向けReactコンポーネント、多言語ローカライズ、ユニットテスト、アプリケーション性能監視を含みます。",
      },
      {
        ...en.experience[0].projects![2],
        description:
          "PowerSyncのオフライン優先構成、Supabase PostgreSQL同期、リアルタイムタスク共同作業、通知、クライアントとの一貫したコミュニケーションを備えたクロスプラットフォームアプリを開発しました。",
      },
    ],
  },
  {
    ...en.experience[1],
    role: "フルスタック開発者",
    period: "2025年2月 - 10月",
    description:
      "MEP企業向けの人員管理プラットフォームを開発・保守しました。作業員記録、勤怠、給与自動化、REST API、安全なAWSデプロイを支えました。",
    projects: [
      {
        ...en.experience[1].projects![0],
        description:
          "複数の建設現場で1,000件以上の作業員記録を追跡できるようにしました。設定可能な残業給与計算、Excel出力、勤怠フロー、認証ミドルウェア、労務・現場・ポートフォリオ管理用REST APIを含みます。",
      },
    ],
  },
  {
    ...en.experience[2],
    role: "プロジェクトインターン",
    period: "2024年2月 - 4月",
    description:
      "リアルタイムLiDAR物体検出フロー向けに、バックエンドシステムとAPIを開発しました。PythonのデータパイプラインをNode.jsサービス、WebGL/Three.jsの可視化システムにつなげました。",
    projects: [
      {
        ...en.experience[2].projects![0],
        description:
          "LiDAR物体検出モデルをExpress.jsサービスの背後に配置しました。1日10GB以上の点群データを処理し、検出結果を3D可視化システムへ提供し、PythonからNodeへのデータ転送レイテンシを30%削減しました。",
      },
    ],
  },
];

const deExperience: ExperienceItem[] = [
  {
    ...en.experience[0],
    role: "Softwareentwickler",
    period: "Nov. 2025 - heute",
    description:
      "Softwareentwickler für produktionsreife Web- und Mobile-Anwendungen für Enterprise-Kunden, darunter Design-System-Dokumentation, mehrsprachige Corporate-Websites und offline-first Kollaborationsflows.",
    projects: [
      {
        ...en.experience[0].projects![0],
        description:
          "Eine Git-basierte Dokumentationsplattform für Design-Systeme gebaut, mit Branch-Kollaboration, Pull-Request-Review, RBAC-Berechtigungen, unveränderlicher Veröffentlichung, TipTap-Editing, IndexedDB-Caching, Autosave-Entwürfen, optimistischer Nebenläufigkeitskontrolle und KI-gestützter Design-Compliance-Analyse.",
      },
      {
        ...en.experience[0].projects![1],
        description:
          "Eine Corporate Website aus Figma-Designs mit produktionsreifen React-Komponenten, mehrsprachiger Lokalisierung, Unit-Tests und Application Performance Monitoring entwickelt.",
      },
      {
        ...en.experience[0].projects![2],
        description:
          "Eine plattformübergreifende Social-Collaboration-App mit PowerSync Offline-first-Architektur, Supabase PostgreSQL-Synchronisierung, Echtzeit-Aufgabenkollaboration, Benachrichtigungen und enger Kundenkommunikation entwickelt.",
      },
    ],
  },
  {
    ...en.experience[1],
    role: "Full-Stack-Entwickler",
    period: "Feb. 2025 - Okt. 2025",
    description:
      "Eine Workforce-Management-Plattform für ein MEP-Unternehmen gebaut und gepflegt, mit Mitarbeiterdaten, Anwesenheit, Lohnautomatisierung, REST APIs und sicherem AWS-Deployment.",
    projects: [
      {
        ...en.experience[1].projects![0],
        description:
          "Die Verwaltung von über 1.000 Mitarbeiterdatensätzen über mehrere Baustellen hinweg ermöglicht, inklusive konfigurierbarer Überstundenabrechnung, Excel-Exporten, Anwesenheitsflows, Authentifizierungs-Middleware und REST APIs für Arbeitskräfte, Standorte und Portfolio-Management.",
      },
    ],
  },
  {
    ...en.experience[2],
    role: "Projektpraktikant",
    period: "Feb. 2024 - Apr. 2024",
    description:
      "Backend-Systeme und APIs für Echtzeit-LiDAR-Objekterkennung entwickelt und Python-Datenpipelines mit Node.js-Services sowie WebGL/Three.js-Visualisierungssystemen verbunden.",
    projects: [
      {
        ...en.experience[2].projects![0],
        description:
          "LiDAR-Objekterkennungsmodelle hinter einem Express.js-Service bereitgestellt, täglich mehr als 10 GB Punktwolkendaten verarbeitet, Erkennungsergebnisse an 3D-Visualisierungssysteme ausgeliefert und die Python-zu-Node-Datenübertragungslatenz um 30% reduziert.",
      },
    ],
  },
];

const jaProofMetrics: ProjectMetric[] = [
  { value: "1,000+", label: "対応した作業員記録" },
  { value: "<100 ms", label: "LiDAR API応答時間" },
  { value: "10 GB+", label: "1日に処理した点群データ" },
  { value: "30%", label: "パイプライン転送レイテンシ削減" },
];

const deProofMetrics: ProjectMetric[] = [
  { value: "1,000+", label: "unterstützte Mitarbeiterdatensätze" },
  { value: "<100 ms", label: "LiDAR API-Antwortzeit" },
  { value: "10 GB+", label: "Punktwolkendaten täglich verarbeitet" },
  { value: "30%", label: "geringere Pipeline-Transferlatenz" },
];

const jaSocialLinks: SocialLink[] = en.socialLinks.map((link) => ({
  ...link,
  ariaLabel:
    link.label === "GitHub"
      ? "GitHubでPavan Patilを見る（新しいタブで開きます）"
      : "LinkedInでPavan Patilを見る（新しいタブで開きます）",
}));

const deSocialLinks: SocialLink[] = en.socialLinks.map((link) => ({
  ...link,
  ariaLabel:
    link.label === "GitHub"
      ? "Pavan Patil auf GitHub besuchen (öffnet in einem neuen Tab)"
      : "Pavan Patil auf LinkedIn besuchen (öffnet in einem neuen Tab)",
}));

export const portfolioContentByLocale: Record<Locale, PortfolioContent> = {
  en,
  ja: {
    ...en,
    profile: {
      ...en.profile,
      role: "ソフトウェアエンジニア",
      heroEyebrow: "ソフトウェアエンジニア · Web・モバイル・バックエンド",
      heroTitle: "信頼できるソフトウェアを作ります",
      heroAccent: "複雑な現場の仕事のために。",
      heroDescription:
        "Pavan Patilです。Web、モバイル、バックエンド、データを扱うシステムを作るソフトウェアエンジニアです。オフライン優先の共同作業プロダクト、企業向け文書フロー、人員管理の自動化、リアルタイムLiDARサービスを開発してきました。",
      about:
        "Pavan Patilです。子どものころ、父が家にコンピューターを持ってきてくれました。その時、画面の下で何が起きているのか知りたくなりました。小学6年生で初めてコードを書き、その好奇心は今も続いています。今は、計画を立て、設計し、ソフトウェアを書き、まだ形のないアイデアを人が使えるシステムにすることが好きです。何度も戻ってきたものが仕事になったことを、とても幸運に感じています。",
      education:
        "電子・コンピューター工学 学士 · PES Modern College of Engineering · 9.4 SGPA",
    },
    socialLinks: jaSocialLinks,
    proofMetrics: jaProofMetrics,
    projects: localizeProjects(jaProjectTranslations),
    experience: jaExperience,
    skillGroups: [
      { ...en.skillGroups[0], label: "言語" },
      { ...en.skillGroups[1], label: "Web・モバイル" },
      { ...en.skillGroups[2], label: "バックエンド・データ" },
      { ...en.skillGroups[3], label: "デリバリー" },
    ],
  },
  de: {
    ...en,
    profile: {
      ...en.profile,
      role: "Softwareentwickler",
      heroEyebrow: "Softwareentwickler · Web, Mobile & Backend",
      heroTitle: "Ich baue zuverlässige Software",
      heroAccent: "für komplexe reale Workflows.",
      heroDescription:
        "Ich bin Pavan Patil, Softwareentwickler für Web, Mobile, Backend und datenintensive Systeme. Ich habe offline-first Kollaborationsprodukte, Enterprise-Dokumentationsflows, Workforce-Automatisierung und Echtzeit-LiDAR-Services gebaut.",
      about:
        "Ich bin Pavan Patil. Mein Interesse an Computern begann in der Kindheit, als mein Vater einen Computer nach Hause brachte und ich wissen wollte, was unter dem Bildschirm passiert. In der sechsten Klasse schrieb ich meinen ersten Code, und diese Neugier ist geblieben. Heute baue ich Produkte gerne Ende zu Ende: den Plan formen, die Architektur entwerfen, Software schreiben und grobe Ideen in Systeme verwandeln, die Menschen nutzen können. Ich bin dankbar, dass das, wozu ich immer zurückkam, mein Beruf wurde.",
      education:
        "Bachelor of Engineering in Electronics and Computer Engineering · PES Modern College of Engineering · 9.4 SGPA",
    },
    socialLinks: deSocialLinks,
    proofMetrics: deProofMetrics,
    projects: localizeProjects(deProjectTranslations),
    experience: deExperience,
    skillGroups: [
      { ...en.skillGroups[0], label: "Sprachen" },
      { ...en.skillGroups[1], label: "Web & Mobile" },
      { ...en.skillGroups[2], label: "Backend & Daten" },
      { ...en.skillGroups[3], label: "Delivery" },
    ],
  },
};
