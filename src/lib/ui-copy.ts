import type { Locale } from "@/lib/i18n";

export type UiCopy = {
  metadata: {
    defaultTitle: string;
    titleTemplate: string;
    description: string;
    openGraphDescription: string;
    twitterDescription: string;
    keywords: string[];
    notFoundTitle: string;
    notFoundDescription: string;
    workNotFoundTitle: string;
  };
  header: {
    skipToMain: string;
    brandAria: string;
    primaryNavigationAria: string;
    navigation: {
      work: string;
      experience: string;
      about: string;
      contact: string;
    };
    home: string;
    resume: string;
    downloadResume: string;
    openUtilities: string;
    utilitiesDialog: string;
    utilitiesHeading: string;
    languageLabel: string;
    languageOptionLabels: Record<"en" | "ja", string>;
    switchLanguageLabel: string;
  };
  theme: {
    switchToDark: string;
    switchToLight: string;
  };
  launch: {
    title: string;
    skip: string;
    websiteLine: string;
  };
  footer: {
    navigationAria: string;
    email: string;
    builtWithCare: string;
    stack: string;
  };
  home: {
    heroPrimaryCta: string;
    heroSecondaryCta: string;
    heroLocation: string;
    heroStageAria: string;
    productStack: string;
    plan: string;
    build: string;
    ship: string;
    web: string;
    mobile: string;
    data: string;
    buildSignal: string;
    healthy: string;
    proofAria: string;
    workEyebrow: string;
    workTitle: string;
    workMuted: string;
    workDescription: string;
    workCount: string;
    experienceEyebrow: string;
    experienceTitle: string;
    experienceMuted: string;
    experienceDescription: string;
    technologyStackAria: string;
    collapseProjects: string;
    showProjects: string;
    aboutEyebrow: string;
    aboutTitle: string;
    aboutMuted: string;
    beyondCode: string;
    beyondHeading: string;
    personalInterestsAria: string;
    personalNotes: Array<{
      label: string;
      text: string;
    }>;
    downloadResume: string;
    portraitAria: string;
    portraitAlt: string;
    quickMessage: {
      eyebrow: string;
      title: string;
      muted: string;
      description: string;
      textareaLabel: string;
      placeholder: string;
      keyboardAria: string;
      helper: string;
      send: string;
      sending: string;
      sent: string;
      emptyError: string;
      tooLongError: string;
      rateLimitError: string;
      deliveryError: string;
      notConfiguredError: string;
      honeypotLabel: string;
      characterCount: string;
    };
    contactEyebrow: string;
    contactTitle: string;
    contactDescription: string;
    contactScheduleLabel: string;
    contactScheduleHelper: string;
    contactScheduleFallbackAria: string;
  };
  projectCard: {
    technologiesAria: string;
    readCaseStudy: string;
    readCaseStudyAria: string;
  };
  projectVisual: {
    sync: {
      liveCollaboration: string;
      synced: string;
      today: string;
      designReview: string;
      nudgeAlex: string;
      teamSync: string;
      offlineQueue: string;
      realtimeChanges: string;
    };
    web: {
      label: string;
      headline: string;
      description: string;
      button: string;
      localeBadge: string;
      apmBadge: string;
    };
    operations: {
      overview: string;
      live: string;
      records: string;
      multiSite: string;
      attendance: string;
      automated: string;
      payroll: string;
      overtime: string;
      workflow: string;
      capability: string;
      status: string;
      rules: string;
      configured: string;
      excel: string;
      exportable: string;
      tracked: string;
    };
  };
  work: {
    selectedWork: string;
    technologiesAria: string;
    factsAria: string;
    articleAria: string;
    role: string;
    experienceContext: string;
    clientCompany: string;
    articleLengthLabel: string;
    articleLength: string;
    articleMap: string;
    sectionsNavigationAria: string;
    contributionEyebrow: string;
    contributionTitle: string;
    nextCaseStudy: string;
    fallbackChallenge: string;
    fallbackApproach: string;
    fallbackOutcome: string;
    caseStudyAlt: string;
  };
  notFound: {
    eyebrow: string;
    title: string;
    description: string;
    viewSelectedWork: string;
    returnHome: string;
  };
};

export const uiCopyByLocale: Record<Locale, UiCopy> = {
  en: {
    metadata: {
      defaultTitle: "Pavan Patil — Software Engineer",
      titleTemplate: "%s — Pavan Patil",
      description:
        "Software engineer building web, mobile, and backend products with TypeScript, React, Next.js, React Native, Node.js, and PostgreSQL.",
      openGraphDescription:
        "Dependable software for complex, real-world workflows across web, mobile, backend, and data-intensive systems.",
      twitterDescription: "Dependable software for complex, real-world workflows.",
      keywords: [
        "Pavan Patil",
        "Software Engineer",
        "TypeScript",
        "React",
        "Next.js",
        "React Native",
        "Node.js",
      ],
      notFoundTitle: "Page not found",
      notFoundDescription: "The requested portfolio page could not be found.",
      workNotFoundTitle: "Work not found",
    },
    header: {
      skipToMain: "Skip to main content",
      brandAria: "Pavan Patil, home",
      primaryNavigationAria: "Primary navigation",
      navigation: {
        work: "Work",
        experience: "Experience",
        about: "About",
        contact: "Contact",
      },
      home: "Home",
      resume: "Résumé",
      downloadResume: "Download résumé",
      openUtilities: "Open navigation utilities",
      utilitiesDialog: "Navigation utilities",
      utilitiesHeading: "Navigation utilities",
      languageLabel: "Language",
      languageOptionLabels: {
        en: "EN",
        ja: "日本語",
      },
      switchLanguageLabel: "Switch language",
    },
    theme: {
      switchToDark: "Switch to dark theme",
      switchToLight: "Switch to light theme",
    },
    launch: {
      title: "pavanpatil.dev launch",
      skip: "Skip",
      websiteLine: "Website: https://pavanpatil.dev",
    },
    footer: {
      navigationAria: "Footer navigation",
      email: "Email",
      builtWithCare: "Designed and built with care.",
      stack: "Next.js · HeroUI · TypeScript",
    },
    home: {
      heroPrimaryCta: "View selected work",
      heroSecondaryCta: "Email me",
      heroLocation: "India · Open to software engineering roles",
      heroStageAria:
        "A software delivery system connecting product requirements, typed code, data, and reliable releases",
      productStack: "Product stack",
      plan: "Plan",
      build: "Build",
      ship: "Ship",
      web: "Web",
      mobile: "Mobile",
      data: "Data",
      buildSignal: "Build signal",
      healthy: "Healthy",
      proofAria: "Selected engineering metrics",
      workEyebrow: "Selected work",
      workTitle: "Built for real constraints.",
      workMuted: "Designed to hold up.",
      workDescription:
        "Three products that show how I approach synchronization, multilingual experiences, operational workflows, and reliable delivery.",
      workCount: "03 case studies",
      experienceEyebrow: "Experience",
      experienceTitle: "Product delivery,",
      experienceMuted: "from interface to infrastructure.",
      experienceDescription:
        "Experience across client products, internal platforms, cloud operations, and real-time research systems.",
      technologyStackAria: "{name} technology stack",
      collapseProjects: "Collapse projects",
      showProjects: "Show projects",
      aboutEyebrow: "About",
      aboutTitle: "Curiosity became craft,",
      aboutMuted: "and craft became my work.",
      beyondCode: "Beyond code",
      beyondHeading: "Discipline, adrenaline, and stillness.",
      personalInterestsAria: "Personal interests",
      personalNotes: [
        {
          label: "Calisthenics",
          text: "Bodyweight training taught me how discipline compounds. Competing nationally in 2024 made that lesson real.",
        },
        {
          label: "Horse riding",
          text: "My adrenaline reset: fast enough to be exciting, controlled enough to demand complete attention.",
        },
        {
          label: "Bike rides",
          text: "When I need quiet, I get on the bike. It clears my head and helps me return with more patience.",
        },
      ],
      downloadResume: "Download résumé",
      portraitAria: "Portrait and profile summary",
      portraitAlt: "Pavan Patil smiling outdoors at night",
      quickMessage: {
        eyebrow: "Anonymous message",
        title: "Type something here",
        muted: "and press return.",
        description:
          "A simple one-way note. No email, no registration, no reply field.",
        textareaLabel: "Message",
        placeholder: "Type a quick note...",
        keyboardAria: "Mechanical keyboard message input",
        helper: "Press Return to send. The keyboard responds to physical keys too.",
        send: "Send message",
        sending: "Sending...",
        sent: "Thanks. Your message was sent.",
        emptyError: "Write a message before sending.",
        tooLongError: "Keep the message under 500 characters.",
        rateLimitError: "Please wait a little before sending another message.",
        deliveryError: "I could not send that message. Please try again.",
        notConfiguredError: "Message delivery is not configured yet.",
        honeypotLabel: "Website",
        characterCount: "{count}/500",
      },
      contactEyebrow: "Let’s build something dependable",
      contactTitle: "Looking for an engineer who can own the details?",
      contactDescription:
        "I’m open to software engineering roles across product, platform, web, and mobile teams.",
      contactScheduleLabel: "Schedule a 20-minute intro",
      contactScheduleHelper: "Google Meet · Times shown in your timezone",
      contactScheduleFallbackAria:
        "Open Google Calendar to schedule a 20-minute intro (opens in a new tab)",
    },
    projectCard: {
      technologiesAria: "{title} technologies",
      readCaseStudy: "View case study",
      readCaseStudyAria: "Read the {title} case study",
    },
    projectVisual: {
      sync: {
        liveCollaboration: "Live collaboration",
        synced: "Synced",
        today: "Today",
        designReview: "Design review",
        nudgeAlex: "Nudge Alex",
        teamSync: "Team sync",
        offlineQueue: "offline queue · 03",
        realtimeChanges: "Realtime changes",
      },
      web: {
        label: "PHILIPS GREENHEART",
        headline: "Multilingual product experience.",
        description: "Region-ready content on a tested component foundation.",
        button: "Explore content",
        localeBadge: "EN · JP",
        apmBadge: "APM · healthy",
      },
      operations: {
        overview: "Workforce overview",
        live: "Live",
        records: "Records",
        multiSite: "Multi-site",
        attendance: "Attendance",
        automated: "Automated",
        payroll: "Payroll",
        overtime: "Overtime",
        workflow: "Workflow",
        capability: "Capability",
        status: "Status",
        rules: "Rules",
        configured: "Configured",
        excel: "Excel",
        exportable: "Exportable",
        tracked: "Tracked",
      },
    },
    work: {
      selectedWork: "Selected work",
      technologiesAria: "{title} technologies",
      factsAria: "{title} project facts",
      articleAria: "{title} case study article",
      role: "Role",
      experienceContext: "Experience context",
      clientCompany: "Client / company",
      articleLengthLabel: "Article length",
      articleLength: "{count} sections",
      articleMap: "Article map",
      sectionsNavigationAria: "{title} case study sections",
      contributionEyebrow: "My contribution",
      contributionTitle: "What I owned across this build.",
      nextCaseStudy: "Next case study",
      fallbackChallenge: "The challenge",
      fallbackApproach: "The approach",
      fallbackOutcome: "The outcome",
      caseStudyAlt: "{title} case study",
    },
    notFound: {
      eyebrow: "404 · Page not found",
      title: "This route doesn’t exist.",
      description:
        "The address may have changed, or the page may never have existed. Pavan’s selected work and verified experience are still available from the portfolio.",
      viewSelectedWork: "View selected work",
      returnHome: "Return home",
    },
  },
  ja: {
    metadata: {
      defaultTitle: "Pavan Patil — ソフトウェアエンジニア",
      titleTemplate: "%s — Pavan Patil",
      description:
        "TypeScript、React、Next.js、React Native、Node.js、PostgreSQLで、Web、モバイル、バックエンドのプロダクトを作るソフトウェアエンジニアです。",
      openGraphDescription:
        "Web、モバイル、バックエンド、データを扱う現場で、複雑な業務に使える信頼性の高いソフトウェアを作ります。",
      twitterDescription: "複雑な現場の仕事に向けた、信頼できるソフトウェア。",
      keywords: [
        "Pavan Patil",
        "ソフトウェアエンジニア",
        "TypeScript",
        "React",
        "Next.js",
        "React Native",
        "Node.js",
      ],
      notFoundTitle: "ページが見つかりません",
      notFoundDescription: "指定されたポートフォリオページは見つかりませんでした。",
      workNotFoundTitle: "実績が見つかりません",
    },
    header: {
      skipToMain: "本文へ移動",
      brandAria: "Pavan Patil、ホーム",
      primaryNavigationAria: "メインナビゲーション",
      navigation: {
        work: "実績",
        experience: "経験",
        about: "紹介",
        contact: "連絡",
      },
      home: "ホーム",
      resume: "履歴書",
      downloadResume: "履歴書をダウンロード",
      openUtilities: "ナビゲーションメニューを開く",
      utilitiesDialog: "ナビゲーションメニュー",
      utilitiesHeading: "ナビゲーションメニュー",
      languageLabel: "言語",
      languageOptionLabels: {
        en: "EN",
        ja: "日本語",
      },
      switchLanguageLabel: "言語を切り替える",
    },
    theme: {
      switchToDark: "ダークテーマに切り替える",
      switchToLight: "ライトテーマに切り替える",
    },
    launch: {
      title: "pavanpatil.dev 起動",
      skip: "スキップ",
      websiteLine: "サイト: https://pavanpatil.dev",
    },
    footer: {
      navigationAria: "フッターナビゲーション",
      email: "メール",
      builtWithCare: "細部まで大切に設計し、実装しました。",
      stack: "Next.js · HeroUI · TypeScript",
    },
    home: {
      heroPrimaryCta: "主な実績を見る",
      heroSecondaryCta: "メールする",
      heroLocation: "インド · ソフトウェアエンジニアの仕事を探しています",
      heroStageAria:
        "プロダクト要件、型付きコード、データ、安定したリリースをつなぐソフトウェア開発システム",
      productStack: "プロダクト構成",
      plan: "計画",
      build: "実装",
      ship: "公開",
      web: "Web",
      mobile: "モバイル",
      data: "データ",
      buildSignal: "ビルド状態",
      healthy: "良好",
      proofAria: "主なエンジニアリング指標",
      workEyebrow: "主な実績",
      workTitle: "現場の制約に向き合って作りました。",
      workMuted: "長く使えることを大切に。",
      workDescription:
        "同期、多言語体験、業務フロー、安定したリリースにどう取り組んだかを示す3つのプロダクトです。",
      workCount: "03 ケーススタディ",
      experienceEyebrow: "経験",
      experienceTitle: "プロダクト開発を、",
      experienceMuted: "画面から基盤まで。",
      experienceDescription:
        "クライアント向けプロダクト、社内基盤、クラウド運用、リアルタイム研究システムでの経験があります。",
      technologyStackAria: "{name} の技術スタック",
      collapseProjects: "プロジェクトを閉じる",
      showProjects: "プロジェクトを見る",
      aboutEyebrow: "紹介",
      aboutTitle: "好奇心が技術になり、",
      aboutMuted: "技術が仕事になりました。",
      beyondCode: "コード以外",
      beyondHeading: "規律、刺激、そして落ち着き。",
      personalInterestsAria: "個人的な関心",
      personalNotes: [
        {
          label: "カリステニクス",
          text: "自重トレーニングから、規律は少しずつ積み上がると学びました。2024年に全国大会へ出たことで、その意味を強く感じました。",
        },
        {
          label: "乗馬",
          text: "気持ちを切り替える時間です。スピード感がありながら、集中と落ち着きも必要です。",
        },
        {
          label: "バイクライド",
          text: "静かに考えたい時はバイクに乗ります。頭が整理され、より落ち着いて戻れます。",
        },
      ],
      downloadResume: "履歴書をダウンロード",
      portraitAria: "写真とプロフィール概要",
      portraitAlt: "夜の屋外で笑っているPavan Patil",
      quickMessage: {
        eyebrow: "匿名メッセージ",
        title: "ここに入力して",
        muted: "Returnで送信。",
        description:
          "シンプルな一方向のメッセージです。メール、登録、返信先は不要です。",
        textareaLabel: "メッセージ",
        placeholder: "短いメッセージを入力...",
        keyboardAria: "メカニカルキーボードのメッセージ入力",
        helper: "Returnで送信できます。物理キーボードにも反応します。",
        send: "メッセージを送る",
        sending: "送信中...",
        sent: "ありがとうございます。メッセージを送信しました。",
        emptyError: "送信前にメッセージを入力してください。",
        tooLongError: "メッセージは500文字以内にしてください。",
        rateLimitError: "少し待ってから、もう一度送信してください。",
        deliveryError: "送信できませんでした。もう一度お試しください。",
        notConfiguredError: "メッセージ送信はまだ設定されていません。",
        honeypotLabel: "Webサイト",
        characterCount: "{count}/500",
      },
      contactEyebrow: "信頼できるものを一緒に作りましょう",
      contactTitle: "細部まで責任を持てるエンジニアをお探しですか？",
      contactDescription:
        "プロダクト、プラットフォーム、Web、モバイルのチームで、ソフトウェアエンジニアの仕事を探しています。",
      contactScheduleLabel: "20分の面談を予約",
      contactScheduleHelper: "Google Meet · お使いのタイムゾーンで表示",
      contactScheduleFallbackAria:
        "Google Calendarで20分の面談を予約する（新しいタブで開きます）",
    },
    projectCard: {
      technologiesAria: "{title} の技術",
      readCaseStudy: "ケーススタディを見る",
      readCaseStudyAria: "{title} のケーススタディを読む",
    },
    projectVisual: {
      sync: {
        liveCollaboration: "リアルタイム共同作業",
        synced: "同期済み",
        today: "今日",
        designReview: "デザイン確認",
        nudgeAlex: "Alexに通知",
        teamSync: "チーム同期",
        offlineQueue: "オフラインキュー · 03",
        realtimeChanges: "リアルタイム変更",
      },
      web: {
        label: "PHILIPS GREENHEART",
        headline: "多言語のプロダクト体験。",
        description: "地域別コンテンツを、テスト済みの部品で支える構成。",
        button: "内容を見る",
        localeBadge: "EN · JP",
        apmBadge: "APM · 良好",
      },
      operations: {
        overview: "人員管理の概要",
        live: "稼働中",
        records: "記録",
        multiSite: "複数拠点",
        attendance: "勤怠",
        automated: "自動化",
        payroll: "給与",
        overtime: "残業",
        workflow: "フロー",
        capability: "機能",
        status: "状態",
        rules: "ルール",
        configured: "設定済み",
        excel: "Excel",
        exportable: "出力可",
        tracked: "記録中",
      },
    },
    work: {
      selectedWork: "主な実績",
      technologiesAria: "{title} の技術",
      factsAria: "{title} のプロジェクト情報",
      articleAria: "{title} のケーススタディ記事",
      role: "役割",
      experienceContext: "経験の文脈",
      clientCompany: "クライアント / 会社",
      articleLengthLabel: "記事の長さ",
      articleLength: "{count} セクション",
      articleMap: "記事マップ",
      sectionsNavigationAria: "{title} のケーススタディセクション",
      contributionEyebrow: "担当したこと",
      contributionTitle: "この開発で私が担当した範囲。",
      nextCaseStudy: "次のケーススタディ",
      fallbackChallenge: "課題",
      fallbackApproach: "取り組み",
      fallbackOutcome: "結果",
      caseStudyAlt: "{title} のケーススタディ",
    },
    notFound: {
      eyebrow: "404 · ページが見つかりません",
      title: "このページは存在しません。",
      description:
        "URLが変わったか、ページが作成されていない可能性があります。Pavanの主な実績と経験はポートフォリオから確認できます。",
      viewSelectedWork: "主な実績を見る",
      returnHome: "ホームに戻る",
    },
  },
  de: {
    metadata: {
      defaultTitle: "Pavan Patil — Softwareentwickler",
      titleTemplate: "%s — Pavan Patil",
      description:
        "Softwareentwickler für Web-, Mobile- und Backend-Produkte mit TypeScript, React, Next.js, React Native, Node.js und PostgreSQL.",
      openGraphDescription:
        "Zuverlässige Software für komplexe reale Abläufe in Web, Mobile, Backend und datenintensiven Systemen.",
      twitterDescription: "Zuverlässige Software für komplexe reale Abläufe.",
      keywords: [
        "Pavan Patil",
        "Softwareentwickler",
        "TypeScript",
        "React",
        "Next.js",
        "React Native",
        "Node.js",
      ],
      notFoundTitle: "Seite nicht gefunden",
      notFoundDescription: "Die angeforderte Portfolioseite wurde nicht gefunden.",
      workNotFoundTitle: "Projekt nicht gefunden",
    },
    header: {
      skipToMain: "Zum Hauptinhalt springen",
      brandAria: "Pavan Patil, Startseite",
      primaryNavigationAria: "Hauptnavigation",
      navigation: {
        work: "Arbeit",
        experience: "Erfahrung",
        about: "Profil",
        contact: "Kontakt",
      },
      home: "Startseite",
      resume: "Lebenslauf",
      downloadResume: "Lebenslauf herunterladen",
      openUtilities: "Navigationsmenü öffnen",
      utilitiesDialog: "Navigationsmenü",
      utilitiesHeading: "Navigationsmenü",
      languageLabel: "Sprache",
      languageOptionLabels: {
        en: "EN",
        ja: "日本語",
      },
      switchLanguageLabel: "Sprache wechseln",
    },
    theme: {
      switchToDark: "Zum dunklen Design wechseln",
      switchToLight: "Zum hellen Design wechseln",
    },
    launch: {
      title: "pavanpatil.dev Start",
      skip: "Überspringen",
      websiteLine: "Website: https://pavanpatil.dev",
    },
    footer: {
      navigationAria: "Footer-Navigation",
      email: "E-Mail",
      builtWithCare: "Mit Sorgfalt entworfen und gebaut.",
      stack: "Next.js · HeroUI · TypeScript",
    },
    home: {
      heroPrimaryCta: "Ausgewählte Arbeit ansehen",
      heroSecondaryCta: "E-Mail senden",
      heroLocation: "Indien · Offen für Softwareentwickler-Rollen",
      heroStageAria:
        "Ein Software-Delivery-System, das Produktanforderungen, typisierten Code, Daten und verlässliche Releases verbindet",
      productStack: "Produkt-Stack",
      plan: "Planen",
      build: "Bauen",
      ship: "Ausliefern",
      web: "Web",
      mobile: "Mobile",
      data: "Daten",
      buildSignal: "Build-Signal",
      healthy: "Stabil",
      proofAria: "Ausgewählte Engineering-Kennzahlen",
      workEyebrow: "Ausgewählte Arbeit",
      workTitle: "Gebaut für reale Anforderungen.",
      workMuted: "Entwickelt, um stabil zu bleiben.",
      workDescription:
        "Drei Produkte, die zeigen, wie ich Synchronisierung, mehrsprachige Erlebnisse, operative Workflows und zuverlässige Lieferung angehe.",
      workCount: "03 Fallstudien",
      experienceEyebrow: "Erfahrung",
      experienceTitle: "Produktlieferung,",
      experienceMuted: "von der Oberfläche bis zur Infrastruktur.",
      experienceDescription:
        "Erfahrung mit Kundenprodukten, internen Plattformen, Cloud-Betrieb und Echtzeit-Forschungssystemen.",
      technologyStackAria: "{name} Technologie-Stack",
      collapseProjects: "Projekte einklappen",
      showProjects: "Projekte anzeigen",
      aboutEyebrow: "Profil",
      aboutTitle: "Neugier wurde Handwerk,",
      aboutMuted: "und Handwerk wurde meine Arbeit.",
      beyondCode: "Neben Code",
      beyondHeading: "Disziplin, Adrenalin und Ruhe.",
      personalInterestsAria: "Persönliche Interessen",
      personalNotes: [
        {
          label: "Calisthenics",
          text: "Training mit dem eigenen Körpergewicht hat mir gezeigt, wie Disziplin wächst. Der nationale Wettbewerb 2024 hat diese Lektion greifbar gemacht.",
        },
        {
          label: "Reiten",
          text: "Mein Reset mit Adrenalin: schnell genug, um spannend zu sein, und kontrolliert genug, um volle Aufmerksamkeit zu verlangen.",
        },
        {
          label: "Motorradfahrten",
          text: "Wenn ich Ruhe brauche, fahre ich los. Das klärt den Kopf und bringt mich geduldiger zurück.",
        },
      ],
      downloadResume: "Lebenslauf herunterladen",
      portraitAria: "Porträt und Profilübersicht",
      portraitAlt: "Pavan Patil lächelt nachts im Freien",
      quickMessage: {
        eyebrow: "Anonyme Nachricht",
        title: "Schreib etwas hier",
        muted: "und drück Return.",
        description:
          "Eine einfache einseitige Nachricht. Keine E-Mail, keine Registrierung, kein Antwortfeld.",
        textareaLabel: "Nachricht",
        placeholder: "Kurze Nachricht schreiben...",
        keyboardAria: "Mechanische Tastatur zur Nachrichteneingabe",
        helper: "Return sendet. Die Tastatur reagiert auch auf physische Tasten.",
        send: "Nachricht senden",
        sending: "Wird gesendet...",
        sent: "Danke. Deine Nachricht wurde gesendet.",
        emptyError: "Schreibe vor dem Senden eine Nachricht.",
        tooLongError: "Bitte halte die Nachricht unter 500 Zeichen.",
        rateLimitError: "Bitte warte kurz, bevor du noch eine Nachricht sendest.",
        deliveryError: "Die Nachricht konnte nicht gesendet werden. Bitte versuche es erneut.",
        notConfiguredError: "Der Nachrichtenversand ist noch nicht eingerichtet.",
        honeypotLabel: "Website",
        characterCount: "{count}/500",
      },
      contactEyebrow: "Lass uns etwas Verlässliches bauen",
      contactTitle: "Suchen Sie einen Entwickler, der Details wirklich übernimmt?",
      contactDescription:
        "Ich bin offen für Softwareentwickler-Rollen in Produkt-, Plattform-, Web- und Mobile-Teams.",
      contactScheduleLabel: "20-minütiges Kennenlernen buchen",
      contactScheduleHelper: "Google Meet · Zeiten in Ihrer Zeitzone",
      contactScheduleFallbackAria:
        "Google Calendar öffnen, um ein 20-minütiges Kennenlernen zu buchen (öffnet in einem neuen Tab)",
    },
    projectCard: {
      technologiesAria: "{title} Technologien",
      readCaseStudy: "Fallstudie ansehen",
      readCaseStudyAria: "Die Fallstudie zu {title} lesen",
    },
    projectVisual: {
      sync: {
        liveCollaboration: "Live-Kollaboration",
        synced: "Synchronisiert",
        today: "Heute",
        designReview: "Design Review",
        nudgeAlex: "Alex erinnern",
        teamSync: "Team-Sync",
        offlineQueue: "Offline-Warteschlange · 03",
        realtimeChanges: "Echtzeitänderungen",
      },
      web: {
        label: "PHILIPS GREENHEART",
        headline: "Mehrsprachiges Produkterlebnis.",
        description: "Regionale Inhalte auf einer getesteten Komponentenbasis.",
        button: "Inhalte ansehen",
        localeBadge: "EN · JP",
        apmBadge: "APM · stabil",
      },
      operations: {
        overview: "Workforce-Übersicht",
        live: "Live",
        records: "Datensätze",
        multiSite: "Mehrere Standorte",
        attendance: "Anwesenheit",
        automated: "Automatisiert",
        payroll: "Lohnlauf",
        overtime: "Überstunden",
        workflow: "Workflow",
        capability: "Funktion",
        status: "Status",
        rules: "Regeln",
        configured: "Konfiguriert",
        excel: "Excel",
        exportable: "Exportierbar",
        tracked: "Erfasst",
      },
    },
    work: {
      selectedWork: "Ausgewählte Arbeit",
      technologiesAria: "{title} Technologien",
      factsAria: "{title} Projektdaten",
      articleAria: "{title} Fallstudienartikel",
      role: "Rolle",
      experienceContext: "Erfahrungskontext",
      clientCompany: "Kunde / Unternehmen",
      articleLengthLabel: "Artikellänge",
      articleLength: "{count} Abschnitte",
      articleMap: "Artikelübersicht",
      sectionsNavigationAria: "{title} Fallstudienabschnitte",
      contributionEyebrow: "Mein Beitrag",
      contributionTitle: "Was ich in diesem Projekt übernommen habe.",
      nextCaseStudy: "Nächste Fallstudie",
      fallbackChallenge: "Die Herausforderung",
      fallbackApproach: "Der Ansatz",
      fallbackOutcome: "Das Ergebnis",
      caseStudyAlt: "{title} Fallstudie",
    },
    notFound: {
      eyebrow: "404 · Seite nicht gefunden",
      title: "Diese Route existiert nicht.",
      description:
        "Die Adresse kann sich geändert haben oder die Seite wurde nie erstellt. Pavans ausgewählte Arbeit und geprüfte Erfahrung sind weiterhin im Portfolio verfügbar.",
      viewSelectedWork: "Ausgewählte Arbeit ansehen",
      returnHome: "Zur Startseite",
    },
  },
};

export function formatCopy(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}
