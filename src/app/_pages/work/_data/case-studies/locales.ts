import { caseStudies } from "./index";
import type { ProjectCaseStudy } from "@/lib/portfolio-types";

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

export const jaProjectTranslations: Record<string, ProjectTranslation> = {
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

export const deProjectTranslations: Record<string, ProjectTranslation> = {
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

export function getLocalizedCaseStudies(translations: Record<string, ProjectTranslation>): ProjectCaseStudy[] {
  return caseStudies.map((project) => {
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
