import { homeContent as en } from "./content";
import type {
  ExperienceItem,
  PortfolioContent,
  ProjectMetric,
  SocialLink,
} from "@/lib/portfolio-types";
import type { Locale } from "@/lib/i18n";
import { caseStudies } from "@/app/_pages/work/_data/case-studies";
import {
  deProjectTranslations,
  getLocalizedCaseStudies,
  jaProjectTranslations,
} from "@/app/_pages/work/_data/case-studies/locales";

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
  en: { ...en, projects: caseStudies },
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
    projects: getLocalizedCaseStudies(jaProjectTranslations),
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
    projects: getLocalizedCaseStudies(deProjectTranslations),
    experience: deExperience,
    skillGroups: [
      { ...en.skillGroups[0], label: "Sprachen" },
      { ...en.skillGroups[1], label: "Web & Mobile" },
      { ...en.skillGroups[2], label: "Backend & Daten" },
      { ...en.skillGroups[3], label: "Delivery" },
    ],
  },
};
