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
    backToSelectedWork: string;
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
    languageOptionLabels: Record<"en" | "ja" | "de", string>;
    switchLanguageLabel: string;
  };
  theme: {
    switchToDark: string;
    switchToLight: string;
  };
  footer: {
    navigationAria: string;
    email: string;
    builtWithCare: string;
    stack: string;
  };
  home: {
    scrollDown: string;
    workEyebrow: string;
    workTitle: string;
    workMuted: string;
    workDescription: string;
    workCount: string;
    experienceEyebrow: string;
    experienceTitle: string;
    experienceMuted: string;
    experienceDescription: string;
    aiWorkflow: {
      eyebrow: string;
      title: string;
      titleMuted: string;
      cta: string;
      /** Accessible name of the home section's list of steps. */
      stepsAria: string;
      /** The home section's step cards. Wrap tool names in **double asterisks**. */
      steps: Array<{
        title: string;
        text: string;
      }>;
      pipelineAria: string;
      testFailed: string;
      testPassed: string;
      planning: Array<{
        label: string;
        tool: string;
      }>;
      branches: Array<{
        task: string;
        steps: Array<{
          label: string;
          tool: string;
        }>;
      }>;
      merge: string;
      ship: {
        label: string;
        tool: string;
      };
    };
    technologyStackAria: string;
    clientProjects: string;
    aboutDisplay: [string, string];
    aboutTitle: string;
    aboutMuted: string;
    beyondCode: string;
    beyondHeading: string;
    personalInterestsAria: string;
    personalNotes: Array<{
      keyword: string;
      label: string;
      text: string;
    }>;
    downloadResume: string;
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
    learning: {
      deck: string;
      due: string;
      word: string;
      meaning: string;
      smartKanji: string;
      reading: string;
      remember: string;
      gotIt: string;
      forgot: string;
      queue: string;
      protected: string;
    };
  };
  work: {
    selectedWork: string;
    technologiesAria: string;
    liveSite: string;
    liveSiteAria: string;
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
        "Software engineer in Bengaluru building web, mobile and backend products from system design to production. Built for Hero Vida, Philips and DRDO.",
      openGraphDescription:
        "Web, mobile and backend products, from system design to production. Built for Hero Vida, Philips and DRDO.",
      twitterDescription: "Web, mobile and backend, end to end. Built for Hero Vida, Philips and DRDO.",
      keywords: [
        "Pavan Patil",
        "Software Engineer",
        "Software Developer",
        "Full-Stack Developer",
        "React Native Developer",
        "Next.js Developer",
        "Bengaluru",
        "India",
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
      backToSelectedWork: "Back to selected work",
      primaryNavigationAria: "Primary navigation",
      navigation: {
        work: "Work",
        experience: "Experience",
        about: "About",
        contact: "Contact",
      },
      home: "Home",
      resume: "Résumé",
      downloadResume: "Open résumé",
      openUtilities: "Open navigation utilities",
      utilitiesDialog: "Navigation utilities",
      utilitiesHeading: "Navigation utilities",
      languageLabel: "Language",
      languageOptionLabels: {
        en: "EN",
        ja: "日本語",
        de: "DE",
      },
      switchLanguageLabel: "Switch language",
    },
    theme: {
      switchToDark: "Switch to dark theme",
      switchToLight: "Switch to light theme",
    },
    footer: {
      navigationAria: "Footer navigation",
      email: "Email",
      builtWithCare: "Designed and built with care.",
      stack: "Next.js · HeroUI · TypeScript",
    },
    home: {
      scrollDown: "Scroll down for proof.",
      workEyebrow: "Selected work",
      workTitle: "Built for real constraints.",
      workMuted: "Designed to hold up.",
      workDescription:
        "Three products that show how I approach learning systems, synchronization, multilingual experiences, and reliable delivery.",
      workCount: "03 case studies",
      experienceEyebrow: "Experience",
      experienceTitle: "Product delivery,",
      experienceMuted: "from interface to infrastructure.",
      experienceDescription:
        "Experience across client products, internal platforms, cloud operations, and real-time research systems.",
      aiWorkflow: {
        eyebrow: "AI workflow",
        title: "See how I use AI to speed up",
        titleMuted: "development.",
        cta: "View my full setup",
        stepsAria: "The four steps of my AI workflow",
        steps: [
          {
            title: "Brainstorm the system",
            text: "I start with **Claude Opus** for planning and architecture. The first pass is a brainstorming session around the problem, constraints, architecture options, goals, acceptance criteria, and test cases.",
          },
          {
            title: "Shape the Master PRD",
            text: "I use **Spec Kit** and **Beads** on top of the brainstorming work to turn the idea into a Master PRD. That document becomes the source of truth for what we are building, why it matters, and how it will be accepted.",
          },
          {
            title: "Break work into tasks",
            text: "For large projects and small features, I use **Beads** to split the work into clear tasks. It keeps features from turning into one vague brief and makes progress easier to review.",
          },
          {
            title: "Run agents by role",
            text: "Once the plan is ready, I run **multiple agents** over the feature. Two agents usually implement, other agents check tests, linting, edge cases, and documentation.",
          },
        ],
        pipelineAria: "AI workflow from brainstorm to task planning with AO coordination, branching into three tasks. T3 fails its first test, returns through build and review, passes its second test, then all tasks merge through git and ship after GitHub Actions verification",
        testFailed: "Test failed",
        testPassed: "Test passed",
        planning: [
          { label: "Brainstorm", tool: "Claude Opus" },
          { label: "Master PRD", tool: "Spec Kit" },
          { label: "Tasks", tool: "Beads + AO" },
        ],
        branches: [
          {
            task: "t1",
            steps: [
              { label: "Build", tool: "Codex + Opus" },
              { label: "Review", tool: "Chaos pass" },
              { label: "Test", tool: "Sonnet" },
            ],
          },
          {
            task: "t2",
            steps: [
              { label: "Build", tool: "Codex + Opus" },
              { label: "Review", tool: "Chaos pass" },
              { label: "Test", tool: "Sonnet" },
            ],
          },
          {
            task: "t3",
            steps: [
              { label: "Build", tool: "Codex + Opus" },
              { label: "Review", tool: "Chaos pass" },
              { label: "Test", tool: "Sonnet" },
            ],
          },
        ],
        merge: "Git merge",
        ship: { label: "Ship", tool: "GitHub Actions" },
      },
      technologyStackAria: "{name} technology stack",
      clientProjects: "Client projects",
      aboutDisplay: ["About", "Me"],
      aboutTitle: "Curiosity became craft,",
      aboutMuted: "and craft became my work.",
      beyondCode: "Beyond code",
      beyondHeading: "Discipline, adrenaline, and stillness.",
      personalInterestsAria: "Personal interests",
      personalNotes: [
        {
          keyword: "Discipline",
          label: "Calisthenics",
          text: "Bodyweight training taught me how discipline compounds. Competing nationally in 2024 made that lesson real.",
        },
        {
          keyword: "Adrenaline",
          label: "Horse riding",
          text: "My adrenaline reset: fast enough to be exciting, controlled enough to demand complete attention.",
        },
        {
          keyword: "Stillness",
          label: "Bike rides",
          text: "When I need quiet, I get on the bike. It clears my head and helps me return with more patience.",
        },
      ],
      downloadResume: "Open résumé",
      portraitAlt: "Pavan Patil smiling outdoors at night",
      quickMessage: {
        eyebrow: "Anonymous message",
        title: "Type something here",
        muted: "and press return.",
        description:
          "A simple one-way note. No email, no registration, no reply field.",
        textareaLabel: "Message",
        placeholder: "Type a quick note…",
        keyboardAria: "Mechanical keyboard message input",
        helper: "Press Return to send. The keyboard responds to physical keys too.",
        send: "Send message",
        sending: "Sending…",
        sent: "Thanks. Your message was sent.",
        emptyError: "Write a message before sending.",
        tooLongError: "Keep the message under 500 characters.",
        rateLimitError: "Please wait a little before sending another message.",
        deliveryError: "I could not send that message. Please try again.",
        notConfiguredError: "Message delivery is not configured yet.",
        honeypotLabel: "Website",
        characterCount: "{count}/500",
      },
      contactEyebrow: "Contact",
      contactTitle: "Looking for an engineer who can own the details?",
      contactDescription:
        "I’m open to software engineering roles across product, platform, web, and mobile teams.",
      contactScheduleLabel: "Book a 30-minute chat",
      contactScheduleHelper: "Google Meet · Times shown in your timezone",
      contactScheduleFallbackAria:
        "Open Google Calendar to book a 30-minute chat (opens in a new tab)",
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
      learning: {
        deck: "Study deck",
        due: "Due today",
        word: "食事",
        meaning: "meal",
        smartKanji: "Smart Kanji",
        reading: "食 · しょく",
        remember: "I remember",
        gotIt: "Got it",
        forgot: "Forgot",
        queue: "Review queue",
        protected: "schedule preserved",
      },
    },
    work: {
      selectedWork: "Selected work",
      technologiesAria: "{title} technologies",
      liveSite: "View live site",
      liveSiteAria: "View the live {title} site (opens in a new tab)",
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
        "The address may have changed, or the page may never have existed. My selected work and experience are still on the homepage.",
      viewSelectedWork: "View selected work",
      returnHome: "Return home",
    },
  },
  ja: {
    metadata: {
      defaultTitle: "Pavan Patil — ソフトウェアエンジニア",
      titleTemplate: "%s — Pavan Patil",
      description:
        "インド・ベンガルール拠点のソフトウェアエンジニアです。Hero Vida、Philips、DRDOの案件で、Web・モバイル・バックエンドを設計から本番リリースまで担当してきました。日本でのお仕事も歓迎しています。",
      openGraphDescription:
        "Hero Vida、Philips、DRDOの案件で、Web・モバイル・バックエンドを設計から本番リリースまで担当。",
      twitterDescription: "Web・モバイル・バックエンドを一貫して。Hero Vida、Philips、DRDOの案件を担当。",
      keywords: [
        "Pavan Patil",
        "ソフトウェアエンジニア",
        "ソフトウェア開発者",
        "フルスタックエンジニア",
        "React Native エンジニア",
        "日本",
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
      backToSelectedWork: "主な実績に戻る",
      primaryNavigationAria: "メインナビゲーション",
      navigation: {
        work: "実績",
        experience: "経験",
        about: "紹介",
        contact: "連絡",
      },
      home: "ホーム",
      resume: "履歴書",
      downloadResume: "履歴書を開く",
      openUtilities: "ナビゲーションメニューを開く",
      utilitiesDialog: "ナビゲーションメニュー",
      utilitiesHeading: "ナビゲーションメニュー",
      languageLabel: "言語",
      languageOptionLabels: {
        en: "EN",
        ja: "日本語",
        de: "DE",
      },
      switchLanguageLabel: "言語を切り替える",
    },
    theme: {
      switchToDark: "ダークテーマに切り替える",
      switchToLight: "ライトテーマに切り替える",
    },
    footer: {
      navigationAria: "フッターナビゲーション",
      email: "メール",
      builtWithCare: "細部まで大切に設計し、実装しました。",
      stack: "Next.js · HeroUI · TypeScript",
    },
    home: {
      scrollDown: "スクロールして実績を見る",
      workEyebrow: "主な実績",
      workTitle: "現場の制約に向き合って作りました。",
      workMuted: "長く使えることを大切に。",
      workDescription:
        "学習システム、同期、多言語体験、安定したリリースにどう取り組んだかを示す3つのプロダクトです。",
      workCount: "03 ケーススタディ",
      experienceEyebrow: "経験",
      experienceTitle: "プロダクト開発を、",
      experienceMuted: "画面から基盤まで。",
      experienceDescription:
        "クライアント向けプロダクト、社内基盤、クラウド運用、リアルタイム研究システムでの経験があります。",
      aiWorkflow: {
        eyebrow: "AIワークフロー",
        title: "AIで開発をどう",
        titleMuted: "速くしているか。",
        cta: "セットアップ全体を見る",
        stepsAria: "AIワークフローの4つのステップ",
        steps: [
          {
            title: "システムをブレストする",
            text: "計画とアーキテクチャには **Claude Opus** から始めます。最初は、課題、制約、アーキテクチャの選択肢、ゴール、受け入れ基準、テストケースを洗い出すブレストです。",
          },
          {
            title: "Master PRDにまとめる",
            text: "ブレストの内容をもとに、**Spec Kit** と **Beads** でアイデアをMaster PRDにまとめます。何を作るのか、なぜ重要なのか、どう受け入れるのかを決める唯一の基準になります。",
          },
          {
            title: "作業をタスクに分ける",
            text: "大きなプロジェクトでも小さな機能でも、**Beads** で作業を明確なタスクに分けます。機能があいまいな一つの依頼にならず、進捗もレビューしやすくなります。",
          },
          {
            title: "役割ごとにエージェントを動かす",
            text: "計画が固まったら、機能に **複数のエージェント** を走らせます。通常は2つのエージェントが実装し、ほかのエージェントがテスト、Lint、エッジケース、ドキュメントを確認します。",
          },
        ],
        pipelineAria: "ブレストからAOで調整したタスク計画へ進み、3つのタスクへ分岐するAIワークフロー。T3は最初のテストに失敗し、実装とレビューに戻り、2回目のテストに合格してから、すべてのタスクをGitでマージし、GitHub Actionsの検証後に公開します",
        testFailed: "テストに失敗",
        testPassed: "テストに合格",
        planning: [
          { label: "ブレスト", tool: "Claude Opus" },
          { label: "Master PRD", tool: "Spec Kit" },
          { label: "タスク", tool: "Beads + AO" },
        ],
        branches: [
          {
            task: "t1",
            steps: [
              { label: "実装", tool: "Codex + Opus" },
              { label: "レビュー", tool: "Chaos pass" },
              { label: "テスト", tool: "Sonnet" },
            ],
          },
          {
            task: "t2",
            steps: [
              { label: "実装", tool: "Codex + Opus" },
              { label: "レビュー", tool: "Chaos pass" },
              { label: "テスト", tool: "Sonnet" },
            ],
          },
          {
            task: "t3",
            steps: [
              { label: "実装", tool: "Codex + Opus" },
              { label: "レビュー", tool: "Chaos pass" },
              { label: "テスト", tool: "Sonnet" },
            ],
          },
        ],
        merge: "Gitマージ",
        ship: { label: "公開", tool: "GitHub Actions" },
      },
      technologyStackAria: "{name} の技術スタック",
      clientProjects: "クライアント案件",
      aboutDisplay: ["私に", "ついて"],
      aboutTitle: "好奇心が技術になり、",
      aboutMuted: "技術が仕事になりました。",
      beyondCode: "コード以外",
      beyondHeading: "規律、刺激、そして落ち着き。",
      personalInterestsAria: "個人的な関心",
      personalNotes: [
        {
          keyword: "規律",
          label: "カリステニクス",
          text: "自重トレーニングから、規律は少しずつ積み上がると学びました。2024年に全国大会へ出たことで、その意味を強く感じました。",
        },
        {
          keyword: "刺激",
          label: "乗馬",
          text: "気持ちを切り替える時間です。スピード感がありながら、集中と落ち着きも必要です。",
        },
        {
          keyword: "落ち着き",
          label: "バイクライド",
          text: "静かに考えたい時はバイクに乗ります。頭が整理され、より落ち着いて戻れます。",
        },
      ],
      downloadResume: "履歴書を開く",
      portraitAlt: "夜の屋外で笑っているPavan Patil",
      quickMessage: {
        eyebrow: "匿名メッセージ",
        title: "ここに入力して",
        muted: "Returnで送信。",
        description:
          "シンプルな一方向のメッセージです。メール、登録、返信先は不要です。",
        textareaLabel: "メッセージ",
        placeholder: "短いメッセージを入力…",
        keyboardAria: "メカニカルキーボードのメッセージ入力",
        helper: "Returnで送信できます。物理キーボードにも反応します。",
        send: "メッセージを送る",
        sending: "送信中…",
        sent: "ありがとうございます。メッセージを送信しました。",
        emptyError: "送信前にメッセージを入力してください。",
        tooLongError: "メッセージは500文字以内にしてください。",
        rateLimitError: "少し待ってから、もう一度送信してください。",
        deliveryError: "送信できませんでした。もう一度お試しください。",
        notConfiguredError: "メッセージ送信はまだ設定されていません。",
        honeypotLabel: "Webサイト",
        characterCount: "{count}/500",
      },
      contactEyebrow: "連絡",
      contactTitle: "細部まで責任を持てるエンジニアをお探しですか？",
      contactDescription:
        "プロダクト、プラットフォーム、Web、モバイルのチームで、ソフトウェアエンジニアの仕事を探しています。",
      contactScheduleLabel: "30分のチャットを予約",
      contactScheduleHelper: "Google Meet · お使いのタイムゾーンで表示",
      contactScheduleFallbackAria:
        "Google Calendarで30分のチャットを予約する（新しいタブで開きます）",
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
      learning: {
        deck: "学習デッキ",
        due: "今日の復習",
        word: "食事",
        meaning: "食事",
        smartKanji: "Smart Kanji",
        reading: "食 · しょく",
        remember: "覚えた",
        gotIt: "できた",
        forgot: "忘れた",
        queue: "復習キュー",
        protected: "予定を保持",
      },
    },
    work: {
      selectedWork: "主な実績",
      technologiesAria: "{title} の技術",
      liveSite: "公開サイトを見る",
      liveSiteAria: "{title} の公開サイトを見る（新しいタブで開きます）",
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
        "URLが変わったか、ページが作成されていない可能性があります。主な実績と経験はホームページで確認できます。",
      viewSelectedWork: "主な実績を見る",
      returnHome: "ホームに戻る",
    },
  },
  de: {
    metadata: {
      defaultTitle: "Pavan Patil — Softwareentwickler",
      titleTemplate: "%s — Pavan Patil",
      description:
        "Softwareentwickler aus Bengaluru, Indien. Web-, Mobile- und Backend-Produkte von Systemdesign bis Produktion, gebaut für Hero Vida, Philips und DRDO.",
      openGraphDescription:
        "Web-, Mobile- und Backend-Produkte von Systemdesign bis Produktion. Gebaut für Hero Vida, Philips und DRDO.",
      twitterDescription: "Web, Mobile und Backend aus einer Hand. Gebaut für Hero Vida, Philips und DRDO.",
      keywords: [
        "Pavan Patil",
        "Softwareentwickler",
        "Full-Stack-Entwickler",
        "React-Native-Entwickler",
        "Bengaluru",
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
      backToSelectedWork: "Zurück zu ausgewählten Arbeiten",
      primaryNavigationAria: "Hauptnavigation",
      navigation: {
        work: "Arbeit",
        experience: "Erfahrung",
        about: "Profil",
        contact: "Kontakt",
      },
      home: "Startseite",
      resume: "Lebenslauf",
      downloadResume: "Lebenslauf öffnen",
      openUtilities: "Navigationsmenü öffnen",
      utilitiesDialog: "Navigationsmenü",
      utilitiesHeading: "Navigationsmenü",
      languageLabel: "Sprache",
      languageOptionLabels: {
        en: "EN",
        ja: "日本語",
        de: "DE",
      },
      switchLanguageLabel: "Sprache wechseln",
    },
    theme: {
      switchToDark: "Zum dunklen Design wechseln",
      switchToLight: "Zum hellen Design wechseln",
    },
    footer: {
      navigationAria: "Footer-Navigation",
      email: "E-Mail",
      builtWithCare: "Mit Sorgfalt entworfen und gebaut.",
      stack: "Next.js · HeroUI · TypeScript",
    },
    home: {
      scrollDown: "Nach unten scrollen – hier sind die Belege.",
      workEyebrow: "Ausgewählte Arbeit",
      workTitle: "Gebaut für reale Anforderungen.",
      workMuted: "Entwickelt, um stabil zu bleiben.",
      workDescription:
        "Drei Produkte, die zeigen, wie ich Lernsysteme, Synchronisierung, mehrsprachige Erlebnisse und zuverlässige Lieferung angehe.",
      workCount: "03 Fallstudien",
      experienceEyebrow: "Erfahrung",
      experienceTitle: "Produktlieferung,",
      experienceMuted: "von der Oberfläche bis zur Infrastruktur.",
      experienceDescription:
        "Erfahrung mit Kundenprodukten, internen Plattformen, Cloud-Betrieb und Echtzeit-Forschungssystemen.",
      aiWorkflow: {
        eyebrow: "AI-Workflow",
        title: "So beschleunige ich die",
        titleMuted: "Entwicklung mit AI.",
        cta: "Mein vollständiges Setup ansehen",
        stepsAria: "Die vier Schritte meines AI-Workflows",
        steps: [
          {
            title: "Das System durchdenken",
            text: "Für Planung und Architektur starte ich mit **Claude Opus**. Der erste Durchgang ist ein Brainstorming zu Problem, Rahmenbedingungen, Architekturoptionen, Zielen, Akzeptanzkriterien und Testfällen.",
          },
          {
            title: "Das Master PRD formen",
            text: "Auf Basis des Brainstormings mache ich mit **Spec Kit** und **Beads** aus der Idee ein Master PRD. Es wird zur einzigen Quelle dafür, was wir bauen, warum es zählt und wie es abgenommen wird.",
          },
          {
            title: "Arbeit in Tasks aufteilen",
            text: "Bei großen Projekten wie bei kleinen Features teile ich die Arbeit mit **Beads** in klare Tasks auf. So wird kein Feature zu einem vagen Briefing, und der Fortschritt lässt sich leichter prüfen.",
          },
          {
            title: "Agents nach Rollen einsetzen",
            text: "Steht der Plan, setze ich **mehrere Agents** auf das Feature an. Meist implementieren zwei, andere prüfen Tests, Linting, Edge Cases und Dokumentation.",
          },
        ],
        pipelineAria: "AI-Workflow vom Brainstorming zur Task-Planung mit AO-Koordination, der in drei Tasks verzweigt. T3 scheitert im ersten Test, kehrt zu Build und Review zurück, besteht den zweiten Test und wird dann über Git gemerged und nach GitHub-Actions-Verifikation ausgeliefert",
        testFailed: "Test fehlgeschlagen",
        testPassed: "Test bestanden",
        planning: [
          { label: "Brainstorming", tool: "Claude Opus" },
          { label: "Master PRD", tool: "Spec Kit" },
          { label: "Tasks", tool: "Beads + AO" },
        ],
        branches: [
          {
            task: "t1",
            steps: [
              { label: "Build", tool: "Codex + Opus" },
              { label: "Review", tool: "Chaos pass" },
              { label: "Test", tool: "Sonnet" },
            ],
          },
          {
            task: "t2",
            steps: [
              { label: "Build", tool: "Codex + Opus" },
              { label: "Review", tool: "Chaos pass" },
              { label: "Test", tool: "Sonnet" },
            ],
          },
          {
            task: "t3",
            steps: [
              { label: "Build", tool: "Codex + Opus" },
              { label: "Review", tool: "Chaos pass" },
              { label: "Test", tool: "Sonnet" },
            ],
          },
        ],
        merge: "Git-Merge",
        ship: { label: "Ship", tool: "GitHub Actions" },
      },
      technologyStackAria: "{name} Technologie-Stack",
      clientProjects: "Kundenprojekte",
      aboutDisplay: ["Über", "mich"],
      aboutTitle: "Neugier wurde Handwerk,",
      aboutMuted: "und Handwerk wurde meine Arbeit.",
      beyondCode: "Neben Code",
      beyondHeading: "Disziplin, Adrenalin und Ruhe.",
      personalInterestsAria: "Persönliche Interessen",
      personalNotes: [
        {
          keyword: "Disziplin",
          label: "Calisthenics",
          text: "Training mit dem eigenen Körpergewicht hat mir gezeigt, wie Disziplin wächst. Der nationale Wettbewerb 2024 hat diese Lektion greifbar gemacht.",
        },
        {
          keyword: "Adrenalin",
          label: "Reiten",
          text: "Mein Reset mit Adrenalin: schnell genug, um spannend zu sein, und kontrolliert genug, um volle Aufmerksamkeit zu verlangen.",
        },
        {
          keyword: "Ruhe",
          label: "Motorradfahrten",
          text: "Wenn ich Ruhe brauche, fahre ich los. Das klärt den Kopf und bringt mich geduldiger zurück.",
        },
      ],
      downloadResume: "Lebenslauf öffnen",
      portraitAlt: "Pavan Patil lächelt nachts im Freien",
      quickMessage: {
        eyebrow: "Anonyme Nachricht",
        title: "Schreib etwas hier",
        muted: "und drück Return.",
        description:
          "Eine einfache einseitige Nachricht. Keine E-Mail, keine Registrierung, kein Antwortfeld.",
        textareaLabel: "Nachricht",
        placeholder: "Kurze Nachricht schreiben…",
        keyboardAria: "Mechanische Tastatur zur Nachrichteneingabe",
        helper: "Return sendet. Die Tastatur reagiert auch auf physische Tasten.",
        send: "Nachricht senden",
        sending: "Wird gesendet…",
        sent: "Danke. Deine Nachricht wurde gesendet.",
        emptyError: "Schreibe vor dem Senden eine Nachricht.",
        tooLongError: "Bitte halte die Nachricht unter 500 Zeichen.",
        rateLimitError: "Bitte warte kurz, bevor du noch eine Nachricht sendest.",
        deliveryError: "Die Nachricht konnte nicht gesendet werden. Bitte versuche es erneut.",
        notConfiguredError: "Der Nachrichtenversand ist noch nicht eingerichtet.",
        honeypotLabel: "Website",
        characterCount: "{count}/500",
      },
      contactEyebrow: "Kontakt",
      contactTitle: "Suchen Sie einen Entwickler, der Details wirklich übernimmt?",
      contactDescription:
        "Ich bin offen für Softwareentwickler-Rollen in Produkt-, Plattform-, Web- und Mobile-Teams.",
      contactScheduleLabel: "30-minütiges Gespräch buchen",
      contactScheduleHelper: "Google Meet · Zeiten in Ihrer Zeitzone",
      contactScheduleFallbackAria:
        "Google Calendar öffnen, um ein 30-minütiges Gespräch zu buchen (öffnet in einem neuen Tab)",
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
      learning: {
        deck: "Lerndeck",
        due: "Heute fällig",
        word: "食事",
        meaning: "Mahlzeit",
        smartKanji: "Smart Kanji",
        reading: "食 · しょく",
        remember: "Ich weiss es",
        gotIt: "Verstanden",
        forgot: "Vergessen",
        queue: "Review-Queue",
        protected: "Zeitplan bleibt",
      },
    },
    work: {
      selectedWork: "Ausgewählte Arbeit",
      technologiesAria: "{title} Technologien",
      liveSite: "Live-Website ansehen",
      liveSiteAria: "Live-Website von {title} ansehen (öffnet in neuem Tab)",
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
        "Die Adresse kann sich geändert haben oder die Seite wurde nie erstellt. Meine ausgewählte Arbeit und Erfahrung findest du weiterhin auf der Startseite.",
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
