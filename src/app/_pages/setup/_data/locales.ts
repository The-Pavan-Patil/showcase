import type { Locale } from "@/lib/i18n";

import { setupContent as en, type SetupCopy } from "./content";

/** Pairs each English item with its translated fields, keeping IDs, states and file names in one place. */
function translate<T extends object, P extends Partial<T>>(items: readonly T[], patches: readonly P[]): T[] {
  if (patches.length !== items.length) {
    throw new Error(`Setup copy: expected ${items.length} translations, got ${patches.length}`);
  }
  return items.map((item, index) => ({ ...item, ...patches[index] }));
}

const ja: SetupCopy = {
  schema: {
    name: "セットアップとAIワークフロー",
    description:
      "Pavan PatilのAIを活用したソフトウェア開発ワークフロー。計画、実装、テスト、レビュー、自動化、ハードウェア環境までを紹介します。",
  },
  hero: {
    ...en.hero,
    eyebrow: "AIワークフローとセットアップ",
    title: "AIを、",
    titleMuted: "開発チームのように使う。",
    lede:
      "エージェントが機能を計画し、実装し、テストし、壊しにかかります。レビューとマージは自分の手に残します。以下は、ひとつの機能が通るループを段階ごとに紹介したものです。",
    primaryCta: "パイプラインを見る",
    secondaryCta: "ケーススタディを見る",
    indexAria: "このページの内容",
    index: translate(en.hero.index, [
      { label: "計画とタスク" },
      { label: "誰が何をするか" },
      { label: "何が壊れるか" },
      { label: "構造を足すとき" },
      { label: "引き継ぎとレビュー" },
      { label: "裏で動くエージェント" },
      { label: "ハードウェア" },
    ]),
  },
  pipeline: {
    eyebrow: "ループ",
    title: "ひとつの機能を、ブレストから公開まで。",
    intro:
      "計画で機能をタスクに分け、タスクごとに実装・レビュー・テストを回します。テストに失敗したタスクだけが前に戻り、すべてが合格するまで何もマージしません。",
  },
  plan: {
    eyebrow: "計画",
    title: "書き出すまでは、何も作らない。",
    intro:
      "AIをいちばん使うのはここです。**Claude Opus** とのブレストで、課題、制約、アーキテクチャの選択肢、テストケースを洗い出します。**Spec Kit** がそれをMaster PRDにまとめ、**Beads** がひとつずつレビューできる大きさのタスクに分けます。",
    prd: {
      ...en.plan.prd,
      comment: "すべてのエージェントにとっての唯一の基準",
      sections: translate(en.plan.prd.sections, [
        { heading: "背景", text: "課題、それを抱える人、そのコスト。" },
        { heading: "ゴール", text: "リリース後、ユーザーにとって何が変わるか。" },
        { heading: "アーキテクチャ", text: "選んだ案と、見送った案。" },
        { heading: "受け入れ基準", text: "どれもエージェントが実行できるチェックとして書く。" },
        { heading: "テストケース", text: "コードが一行もないうちに書く。" },
      ]),
    },
    tasks: {
      ...en.plan.tasks,
      aria: "ひとつの機能のBeadsタスク一覧",
      afterLabel: "依存:",
      statusLabels: { done: "完了", active: "進行中", ready: "着手可", blocked: "待ち" },
      rows: translate(en.plan.tasks.rows, [
        { title: "データモデルとマイグレーション" },
        { title: "新しいフローのAPI" },
        { title: "画面と空の状態" },
        { title: "受け入れ基準からのテスト" },
        { title: "引き継ぎメモ" },
      ]),
    },
  },
  team: {
    eyebrow: "チーム",
    title: "2つが作り、残りが確かめる。",
    intro:
      "各エージェントはひとつの領域にとどまります。PRDとタスク一覧が、全員を同じ結果に向けておきます。",
    caption: "機能におけるエージェントの役割",
    columns: { role: "役割", agent: "エージェント", stage: "段階", focus: "担当" },
    rows: translate(en.team.rows, [
      {
        role: "フロントエンド",
        stage: "実装",
        focus: "画面、レイアウト、レスポンシブ挙動。既存のデザインシステムに沿わせます。",
      },
      {
        role: "バックエンド",
        agent: "Claude Opus · ターミナル",
        stage: "実装",
        focus: "アーキテクチャ、API、データモデル、サービス単位のトレードオフ。",
      },
      { role: "カオス", stage: "レビュー", focus: "誰かの目に触れる前に、実装を攻撃します。" },
      { role: "テスト", stage: "テスト", focus: "受け入れ基準、テストカバレッジ、Lint、エッジケース。" },
      {
        role: "ドキュメント",
        stage: "仕上げ",
        focus: "実装メモ、引き継ぎファイル、リポジトリの文脈。コーディングの後も読める状態に保ちます。",
      },
    ]),
  },
  chaos: {
    eyebrow: "カオスエンジニアリング",
    title: "唯一の仕事は、ビルドを壊すこと。",
    body: [
      "すべてがうまくいったときにしか動かない箇所を探し出し、ユーザーより先に設計へ負荷をかけます。",
      "AIを作り手から、失敗を探しに行くレビュアーに変える役割です。",
    ],
    log: {
      ...en.chaos.log,
      aria: "カオスエージェントのレポート例",
      entries: translate(en.chaos.log.entries, [
        { area: "前提", text: "コードが頼りにしている項目が空で届く。" },
        { area: "エッジケース", text: "空のリストでレイアウトが崩れる。" },
        { area: "復旧", text: "再試行に失敗すると、スピナーが回り続ける。" },
        { area: "状態", text: "戻ると、保存途中のフォームが復元される。" },
        { area: "競合", text: "素早く2回保存すると、互いに上書きする。" },
        { area: "導線", text: "ある手順から戻る方法がわからない。" },
        { area: "正常系", text: "ネットワークが安定しているときしか動かない。" },
      ]),
      summary: "失敗4件、警告3件 · 実装に差し戻し",
    },
  },
  orchestration: {
    eyebrow: "オーケストレーション",
    title: "大きなシステムに必要なのは、エージェントの数より構造。",
    intro:
      "下の層で作業をまとめきれなくなったときだけ、層をひとつ足します。どの段階でも、唯一の基準は **Git** です。",
    aria: "構造の少ないものから多いものへ並べたオーケストレーションツール",
    levelLabel: "レベル",
    whenLabel: "次に進むとき",
    steps: translate(en.orchestration.steps, [
      {
        text: "エージェントを起動して調整し、各役割を現在の計画に結びつけておきます。",
        when: "機能に2つ以上のエージェントが必要になったとき。",
      },
      {
        tool: "AO または Python",
        text: "**Agent Orchestrator** かPythonスクリプトで、エージェントの順番、リトライ、引き継ぎ、チェックポイントを固定します。",
        when: "実行をもっと細かく制御したいとき。",
      },
      {
        text: "作業をひとつのループではなく、エージェントのグラフとして組み立てます。",
        when: "機能が単純なエージェントループに収まらなくなったとき。",
      },
      {
        text: "障害を越えて続く必要がある長い実行のための、耐久性のあるオーケストレーション。",
        when: "信頼性がいちばん大事なとき。",
      },
    ]),
  },
  handover: {
    eyebrow: "引き継ぎとレビュー",
    title: "引き継ぎファイルでリポジトリをそろえ、マージは自分で。",
    intro:
      "プロジェクトが複数のディレクトリやリポジトリにまたがるときは、引き継ぎファイルを作業と一緒に渡し、フロントエンド、バックエンド、テスト、ドキュメントがずれないようにします。",
    file: {
      ...en.handover.file,
      sections: translate(en.handover.file.sections, [
        { heading: "変更点", items: ["リポジトリとディレクトリごとの、すべての変更"] },
        { heading: "残りの作業", items: ["未完了のタスクと、それぞれの担当"] },
        { heading: "共有の前提", items: ["どちらの側も前提にする取り決め"] },
      ]),
    },
    rules: {
      dontTitle: "エージェントがしないこと",
      dont: ["自分でPull Requestを作る。", "自分のコードをマージする。"],
      doTitle: "自分が必ずすること",
      do: [
        "コミットやマージの前に、未コミットの変更を手で確認する。",
        "結果が足りなければ、エージェントを再実行するか、手で直すか、足りない部分を自分で書く。",
        "Gitのレビューと小さな修正は、メインのIDEである **Cursor** で、軽いエージェントと並べて行う。",
      ],
    },
  },
  automation: {
    eyebrow: "自動化",
    title: "裏で動くエージェントが報告してくれるので、確認しに行かなくていい。",
    intro:
      "自分が見ていなくても動くエージェントが2つあります。ひとつはコードベースのため、もうひとつは一日のそのほかのためです。",
    ci: {
      title: "GitHub Actionsのエージェント",
      aria: "GitHub Actionsエージェントからのデプロイ通知",
      events: translate(en.automation.ci.events, [
        { label: "マージ済み", text: "レビューした変更がmainブランチに入りました。" },
        { label: "進行中", text: "デプロイを実行しています。" },
        { label: "失敗", text: "デプロイが止まり、確認が必要です。" },
        { label: "完了", text: "デプロイが公開されました。" },
      ]),
    },
    personal: {
      title: "Hermesエージェント",
      tag: "セルフホスト",
      aria: "Hermesエージェントが担当すること",
      tasks: ["一日を始める", "メールを確認する", "会議を振り返る", "細かな個人タスクをこなす"],
    },
  },
  desk: {
    eyebrow: "作業環境",
    title: "ハードウェアはシンプルで信頼できるものに。",
    items: [
      {
        title: "メインマシン",
        text: "開発、AIを使ったコーディング、計画、レビュー、リリース作業に使うMacBook Air M5。",
      },
      { title: "サブマシン", text: "個人の作業と、別の環境として使うMacBook M1。" },
      {
        title: "デスク",
        text: "日常の作業環境は、BenQの27インチモニター2790QとLogitech Pebble 2。",
      },
    ],
  },
  closing: {
    title: "セットアップは変わり続けても、向かう方向は変わらない。",
    text: "より速いフィードバック、より良い思考、繰り返しの少ない作業。そして、センスと判断と丁寧さが必要な部分に、より多くの時間を使うこと。",
  },
};

const de: SetupCopy = {
  schema: {
    name: "Setup und AI-Workflow",
    description:
      "Pavan Patils AI-gestützter Software-Workflow: Planung, Umsetzung, Tests, Review, Automatisierung und Hardware-Setup.",
  },
  hero: {
    ...en.hero,
    eyebrow: "AI-Workflow und Setup",
    title: "Ich nutze AI wie ein",
    titleMuted: "Engineering-Team um mich herum.",
    lede:
      "Agents planen, bauen, testen und attackieren jedes Feature. Review und Merge bleiben bei mir. Unten steht die Schleife, die jedes Feature durchläuft, Stufe für Stufe.",
    primaryCta: "Pipeline ansehen",
    secondaryCta: "Case Studies ansehen",
    indexAria: "Auf dieser Seite",
    index: translate(en.hero.index, [
      { label: "Planung und Tasks" },
      { label: "Wer was macht" },
      { label: "Was kaputtgeht" },
      { label: "Wann mehr Struktur nötig ist" },
      { label: "Übergabe und Review" },
      { label: "Agents im Hintergrund" },
      { label: "Hardware" },
    ]),
  },
  pipeline: {
    eyebrow: "Die Schleife",
    title: "Ein Feature, vom Brainstorming bis zum Release.",
    intro:
      "Die Planung teilt ein Feature in Tasks, und jeder Task bekommt eigenen Build, eigenes Review und eigene Tests. Scheitert ein Test, läuft nur dieser Task zurück. Gemerged wird erst, wenn alle bestehen.",
  },
  plan: {
    eyebrow: "Planung",
    title: "Gebaut wird erst, was aufgeschrieben ist.",
    intro:
      "Hier setze ich AI am stärksten ein. Ein Brainstorming mit **Claude Opus** arbeitet Problem, Rahmenbedingungen, Architekturoptionen und Testfälle durch. **Spec Kit** macht daraus ein Master PRD, und **Beads** teilt es in Tasks, die klein genug sind, um sie einzeln zu prüfen.",
    prd: {
      ...en.plan.prd,
      comment: "einzige Quelle der Wahrheit für jeden Agent",
      sections: translate(en.plan.prd.sections, [
        { heading: "Warum", text: "Das Problem, wer es hat und was es kostet." },
        { heading: "Ziele", text: "Was sich für Nutzer ändert, sobald es live ist." },
        { heading: "Architektur", text: "Die gewählte Option und die verworfenen." },
        {
          heading: "Akzeptanzkriterien",
          text: "Jedes als Prüfung formuliert, die ein Agent ausführen kann.",
        },
        { heading: "Testfälle", text: "Jetzt geschrieben, bevor es Code gibt." },
      ]),
    },
    tasks: {
      ...en.plan.tasks,
      aria: "Beads-Taskliste für ein Feature",
      afterLabel: "nach",
      statusLabels: { done: "erledigt", active: "in Arbeit", ready: "bereit", blocked: "blockiert" },
      rows: translate(en.plan.tasks.rows, [
        { title: "Datenmodell und Migrationen" },
        { title: "API für den neuen Flow" },
        { title: "Oberfläche und leere Zustände" },
        { title: "Tests aus den Akzeptanzkriterien" },
        { title: "Übergabenotizen" },
      ]),
    },
  },
  team: {
    eyebrow: "Das Team",
    title: "Zwei Agents bauen. Der Rest prüft.",
    intro:
      "Jeder Agent bleibt in einer Domäne. PRD und Taskliste richten alle auf dasselbe Ergebnis aus.",
    caption: "Rollen der Agents in einem Feature",
    columns: { role: "Rolle", agent: "Agent", stage: "Phase", focus: "Fokus" },
    rows: translate(en.team.rows, [
      {
        focus: "Oberflächen, Layouts und responsives Verhalten, nah am bestehenden Designsystem.",
      },
      {
        agent: "Claude Opus · Terminal",
        focus: "Architektur, APIs, Datenmodelle und Abwägungen auf Service-Ebene.",
      },
      { focus: "Greift den Build an, bevor ihn jemand anderes sieht." },
      { focus: "Akzeptanzkriterien, Testabdeckung, Linting und Edge Cases." },
      {
        stage: "Abschluss",
        focus:
          "Implementierungsnotizen, Übergabedateien und Repo-Kontext, die nach dem Coding lesbar bleiben.",
      },
    ]),
  },
  chaos: {
    eyebrow: "Chaos Engineering",
    title: "Ein Agent hat nur eine Aufgabe: den Build zu brechen.",
    body: [
      "Er sucht die Stellen, an denen das System nur funktioniert, wenn alles glattläuft, und setzt das Design unter Druck, bevor Nutzer es tun.",
      "So wird AI vom Builder zum Reviewer, der gezielt nach Fehlern sucht.",
    ],
    log: {
      ...en.chaos.log,
      aria: "Beispielbericht des Chaos-Agents",
      entries: translate(en.chaos.log.entries, [
        { area: "Annahme", text: "Ein Feld, auf das sich der Code verlässt, kommt leer an." },
        { area: "Edge Case", text: "Eine leere Liste zerschießt das Layout." },
        { area: "Recovery", text: "Ein fehlgeschlagener Retry lässt den Spinner weiterlaufen." },
        { area: "Zustand", text: "Zurück stellt ein halb gespeichertes Formular wieder her." },
        { area: "Race", text: "Zwei schnelle Speichervorgänge überschreiben sich." },
        { area: "User Flow", text: "Ein Schritt hat keinen klaren Weg zurück." },
        { area: "Happy Path", text: "Es funktioniert nur, solange das Netz hält." },
      ]),
      summary: "4 fehlgeschlagen, 3 Warnungen · zurück an den Build",
    },
  },
  orchestration: {
    eyebrow: "Orchestrierung",
    title: "Größere Systeme brauchen mehr Struktur, nicht mehr Agents.",
    intro:
      "Ich füge eine Ebene erst hinzu, wenn die darunter die Arbeit nicht mehr zusammenhält. Auf jeder Ebene bleibt **Git** die einzige Quelle der Wahrheit.",
    aria: "Orchestrierungstools, von wenig bis viel Struktur",
    levelLabel: "Ebene",
    whenLabel: "Nächste Ebene, wenn",
    steps: translate(en.orchestration.steps, [
      {
        text: "Startet die Agents, koordiniert sie und hält jede Rolle am aktuellen Plan.",
        when: "ein Feature mehr als einen Agent braucht.",
      },
      {
        tool: "AO oder Python",
        text: "**Agent Orchestrator** oder ein Python-Skript legt Reihenfolge, Retries, Übergaben und Checkpoints der Agents fest.",
        when: "der Lauf engere Kontrolle braucht.",
      },
      {
        text: "Bildet die Arbeit als Graph von Agents ab statt als eine Schleife.",
        when: "ein Feature einer einfachen Agent-Schleife entwächst.",
      },
      {
        text: "Dauerhafte Orchestrierung für lange Läufe, die Ausfälle überstehen müssen.",
        when: "Zuverlässigkeit am wichtigsten ist.",
      },
    ]),
  },
  handover: {
    eyebrow: "Übergabe und Review",
    title: "Übergabedateien halten Repos im Gleichschritt. Der Merge bleibt bei mir.",
    intro:
      "Wenn ein Projekt mehrere Verzeichnisse oder Repositories umfasst, reist eine Übergabedatei mit der Arbeit, damit Frontend, Backend, Tests und Docs nicht auseinanderlaufen.",
    file: {
      ...en.handover.file,
      sections: translate(en.handover.file.sections, [
        { heading: "Was sich geändert hat", items: ["Jede Änderung, nach Repo und Verzeichnis"] },
        { heading: "Noch offen", items: ["Offene Tasks und wer sie übernimmt"] },
        { heading: "Gemeinsame Annahmen", items: ["Die Verträge, auf die alle Seiten bauen"] },
      ]),
    },
    rules: {
      dontTitle: "Was Agents nie tun",
      dont: ["Selbst Pull Requests öffnen.", "Ihren eigenen Code mergen."],
      doTitle: "Was ich immer tue",
      do: [
        "Nicht committete Änderungen vor Commit oder Merge von Hand prüfen.",
        "Den Agent neu starten, von Hand nachbessern oder fehlende Teile selbst schreiben, wenn das Ergebnis nicht reicht.",
        "Git-Review und kleine Fixes in **Cursor**, meiner Haupt-IDE, mit schnellen Agents nebenbei.",
      ],
    },
  },
  automation: {
    eyebrow: "Automatisierung",
    title: "Agents im Hintergrund melden sich, ich muss nicht nachsehen.",
    intro:
      "Zwei Agents laufen, ohne dass ich zusehe: einer für die Codebasis, einer für den Rest des Tages.",
    ci: {
      title: "GitHub-Actions-Agents",
      aria: "Deployment-Meldungen der GitHub-Actions-Agents",
      events: translate(en.automation.ci.events, [
        { label: "Gemerged", text: "Geprüfte Änderungen sind auf dem Main-Branch." },
        { label: "Läuft", text: "Das Deployment läuft." },
        { label: "Fehlgeschlagen", text: "Das Deployment ist gestoppt und braucht einen Blick." },
        { label: "Abgeschlossen", text: "Das Deployment ist live." },
      ]),
    },
    personal: {
      title: "Hermes-Agent",
      tag: "selbst gehostet",
      aria: "Was der Hermes-Agent übernimmt",
      tasks: [
        "Startet den Tag",
        "Prüft E-Mails",
        "Geht Meetings durch",
        "Erledigt kleine persönliche Aufgaben",
      ],
    },
  },
  desk: {
    eyebrow: "Arbeitsplatz",
    title: "Die Hardware bleibt einfach und zuverlässig.",
    items: [
      {
        title: "Hauptrechner",
        text: "MacBook Air M5 für Entwicklung, AI-gestütztes Coding, Planung, Review und Releases.",
      },
      {
        title: "Zweitrechner",
        text: "MacBook M1 für Privates und als separate Zweitumgebung.",
      },
      {
        title: "Schreibtisch",
        text: "BenQ-27-Zoll-Monitor 2790Q mit einer Logitech Pebble 2 für den Alltag.",
      },
    ],
  },
  closing: {
    title: "Das Setup ändert sich ständig, die Richtung bleibt gleich.",
    text: "Schnelleres Feedback, besseres Denken, weniger Wiederholung und mehr Zeit für die Teile von Software, die Geschmack, Urteilsvermögen und Sorgfalt brauchen.",
  },
};

export const setupCopyByLocale: Record<Locale, SetupCopy> = { en, ja, de };
