import {
  ArrowDown,
  ArrowRight,
  CalendarClock,
  Check,
  CheckCircle2,
  CircleDashed,
  GitMerge,
  Laptop,
  ListTodo,
  Mail,
  Monitor,
  Sunrise,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { AiWorkflowDiagram } from "@/components/ai-workflow-diagram";
import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { getPersonId } from "@/lib/structured-data";
import { SiteFooter } from "@/components/site-footer";
import { ScrollAccent } from "@/components/scroll-accent";
import { getHashHref, getSetupPath, type Locale } from "@/lib/i18n";
import { getPortfolioContent } from "@/lib/portfolio";
import { richText } from "@/lib/rich-text";
import { getSiteUrl } from "@/lib/site";
import { uiCopyByLocale } from "@/lib/ui-copy";

import { ChaosLiveLog } from "./_components/chaos-live-log";
import { PrdTypewriter } from "./_components/prd-typewriter";
import { SetupIndexNav } from "./_components/setup-index-nav";
import { SetupReveal } from "./_components/setup-reveal";
import type { SetupCiState } from "./_data/content";
import { setupCopyByLocale } from "./_data/locales";

/** Sets the custom properties the entrance animations read (order, level). */
function cssVars(vars: Record<`--${string}`, number>) {
  return vars as CSSProperties;
}

const deskIcons = [Laptop, Laptop, Monitor] as const;
const routineIcons = [Sunrise, Mail, CalendarClock, ListTodo] as const;
const ciIcons: Record<SetupCiState, typeof GitMerge> = {
  merged: GitMerge,
  progress: CircleDashed,
  failed: XCircle,
  completed: CheckCircle2,
};

function SetupEyebrow({
  anchor,
  children,
  fallback = false,
}: {
  anchor: string;
  children: string;
  fallback?: boolean;
}) {
  return (
    <p className="eyebrow scroll-accent-eyebrow">
      <span
        className={
          fallback
            ? "scroll-accent-heading-target scroll-accent-fallback"
            : "scroll-accent-heading-target"
        }
        data-scroll-accent-anchor={anchor}
        data-scroll-accent-phase="heading"
        aria-hidden="true"
      />
      {children}
    </p>
  );
}

function SetupHeading({
  anchor,
  eyebrow,
  id,
  title,
  intro,
}: {
  anchor: string;
  eyebrow: string;
  id: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="setup-section-heading">
      <SetupEyebrow anchor={anchor}>{eyebrow}</SetupEyebrow>
      <h2 id={id}>{title}</h2>
      {intro ? <p>{richText(intro)}</p> : null}
    </div>
  );
}

/** Title bar of a file or terminal window. The dots are decoration. */
function WindowBar({ title, tag }: { title: string; tag?: string }) {
  return (
    <div className="window-bar">
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      <p translate="no">{title}</p>
      {tag ? <strong translate="no">{tag}</strong> : null}
    </div>
  );
}

function Code({ children }: { children: ReactNode }) {
  return <code translate="no">{children}</code>;
}

export function SetupPage({ locale }: { locale: Locale }) {
  const siteUrl = getSiteUrl();
  const ui = uiCopyByLocale[locale];
  const copy = setupCopyByLocale[locale];
  const { profile, socialLinks } = getPortfolioContent(locale);
  const canonicalPath = getSetupPath(locale);
  const { hero, pipeline, plan, team, chaos, orchestration, handover, automation, desk, closing } =
    copy;
  // Handover rows appear one by one: the file's name and blocks, then each rule.
  const dontStart = 1 + handover.file.sections.length;
  const doStart = dontStart + 1 + handover.rules.dont.length;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: copy.schema.name,
          description: copy.schema.description,
          url: `${siteUrl}${canonicalPath}`,
          inLanguage: locale,
          mainEntity: {
            "@type": "Person",
            "@id": getPersonId(siteUrl),
            name: profile.name,
            jobTitle: profile.role,
          },
        }}
      />
      <ScrollAccent />
      <main id="main-content" className="setup-main">
        <section className="setup-hero" aria-labelledby="setup-title">
          <Container>
            <div className="setup-hero-grid">
              <div className="setup-hero-copy">
                <SetupEyebrow anchor="hero" fallback>
                  {hero.eyebrow}
                </SetupEyebrow>
                <h1 id="setup-title">
                  {hero.title}{" "}
                  <span className="heading-muted">{hero.titleMuted}</span>
                </h1>
                <p className="setup-lede">{hero.lede}</p>
                <div className="hero-actions setup-hero-actions">
                  <a className="primary-cta" href="#pipeline">
                    {hero.primaryCta}
                    <ArrowDown aria-hidden="true" size={17} />
                  </a>
                  <Link className="secondary-cta" href={getHashHref(locale, "#work")}>
                    {hero.secondaryCta}
                    <ArrowRight aria-hidden="true" size={17} />
                  </Link>
                </div>
              </div>

              <SetupIndexNav className="setup-index" aria-label={hero.indexAria}>
                <WindowBar title={hero.indexPath} />
                <ol className="setup-index-list">
                  {hero.index.map((item) => (
                    <li key={item.target}>
                      <a href={`#${item.target}`}>
                        <Code>{item.file}</Code>
                        <span>{item.label}</span>
                        <ArrowDown aria-hidden="true" size={15} />
                      </a>
                    </li>
                  ))}
                </ol>
              </SetupIndexNav>
            </div>
          </Container>
        </section>

        <section className="setup-section" id="pipeline" aria-labelledby="pipeline-heading">
          <Container>
            <SetupHeading
              anchor="pipeline"
              eyebrow={pipeline.eyebrow}
              id="pipeline-heading"
              title={pipeline.title}
              intro={pipeline.intro}
            />
            <div className="setup-workflow-diagram">
              <AiWorkflowDiagram workflow={ui.home.aiWorkflow} />
            </div>
          </Container>
        </section>

        <section
          className="setup-section setup-section-muted setup-stage"
          id="plan"
          aria-labelledby="plan-heading"
        >
          <Container>
            <SetupHeading
              anchor="plan"
              eyebrow={plan.eyebrow}
              id="plan-heading"
              title={plan.title}
              intro={plan.intro}
            />

            <div className="setup-artifacts">
              <div className="setup-window" role="group" aria-label={plan.prd.file}>
                <WindowBar title={plan.prd.file} tag={plan.prd.tool} />
                <PrdTypewriter prd={plan.prd} />
              </div>

              <SetupReveal
                className="setup-window setup-tasks-window"
                role="group"
                aria-label={plan.tasks.aria}
              >
                <WindowBar title="terminal" tag={plan.tasks.tool} />
                <div className="setup-tasks">
                  <p className="setup-tasks-prompt">
                    <span aria-hidden="true">$</span>
                    <code
                      translate="no"
                      style={cssVars({ "--chars": plan.tasks.command.length })}
                    >
                      {plan.tasks.command}
                    </code>
                  </p>
                  <ul>
                    {plan.tasks.rows.map((row, index) => (
                      <li key={row.id} data-status={row.status} style={cssVars({ "--i": index })}>
                        <Code>{row.id}</Code>
                        <span className="setup-task-title">
                          {row.title}
                          {row.after ? (
                            <small>
                              {plan.tasks.afterLabel} <Code>{row.after}</Code>
                            </small>
                          ) : null}
                        </span>
                        <span className="setup-task-status">
                          {plan.tasks.statusLabels[row.status]}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </SetupReveal>
            </div>
          </Container>
        </section>

        <section className="setup-section setup-stage" id="team" aria-labelledby="team-heading">
          <Container>
            <SetupHeading
              anchor="team"
              eyebrow={team.eyebrow}
              id="team-heading"
              title={team.title}
              intro={team.intro}
            />

            <SetupReveal className="setup-team">
              <table className="setup-team-table">
              <caption className="sr-only">{team.caption}</caption>
              <thead>
                <tr>
                  <th scope="col">{team.columns.role}</th>
                  <th scope="col">{team.columns.agent}</th>
                  <th scope="col">{team.columns.stage}</th>
                  <th scope="col">{team.columns.focus}</th>
                </tr>
              </thead>
              <tbody>
                {team.rows.map((row, index) => (
                  <tr
                    key={row.role}
                    style={cssVars({ "--row": index, "--rows": team.rows.length })}
                  >
                    <th scope="row">{row.role}</th>
                    <td>
                      <span className="setup-chip" translate="no">
                        {row.agent}
                      </span>
                    </td>
                    <td>{row.stage}</td>
                    <td>{row.focus}</td>
                  </tr>
                ))}
              </tbody>
              </table>
            </SetupReveal>
          </Container>
        </section>

        <section
          className="setup-chaos-section setup-stage"
          id="chaos"
          aria-labelledby="chaos-heading"
        >
          <Container>
            <div className="setup-chaos-grid">
              <div className="setup-chaos-copy">
                <SetupEyebrow anchor="chaos">{chaos.eyebrow}</SetupEyebrow>
                <h2 id="chaos-heading">{chaos.title}</h2>
                {chaos.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <ChaosLiveLog log={chaos.log} />
            </div>
          </Container>
        </section>

        <section
          className="setup-section setup-section-muted setup-stage"
          id="orchestration"
          aria-labelledby="orchestration-heading"
        >
          <Container>
            <SetupHeading
              anchor="orchestration"
              eyebrow={orchestration.eyebrow}
              id="orchestration-heading"
              title={orchestration.title}
              intro={orchestration.intro}
            />

            <SetupReveal className="setup-ladder-reveal">
              <ol className="setup-ladder" aria-label={orchestration.aria}>
              {orchestration.steps.map((step, index) => (
                <li
                  key={step.tool}
                  style={cssVars({ "--level": index + 1 })}
                  data-level={index + 1}
                >
                  <div className="setup-ladder-track" aria-hidden="true">
                    <span className="setup-ladder-bar">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3>
                    <span className="sr-only">
                      {orchestration.levelLabel} {index + 1}:{" "}
                    </span>
                    <span translate="no">{step.tool}</span>
                  </h3>
                  <p>{richText(step.text)}</p>
                  <p className="setup-ladder-when">
                    <strong>{orchestration.whenLabel}</strong> {step.when}
                  </p>
                </li>
              ))}
              </ol>
            </SetupReveal>
          </Container>
        </section>

        <section
          className="setup-section setup-stage"
          id="handover"
          aria-labelledby="handover-heading"
        >
          <Container>
            <SetupHeading
              anchor="handover"
              eyebrow={handover.eyebrow}
              id="handover-heading"
              title={handover.title}
              intro={handover.intro}
            />

            <SetupReveal className="setup-handover-grid">
              <article className="setup-sheet" aria-label={handover.file.name}>
                <p className="setup-sheet-name" translate="no" style={cssVars({ "--seq": 0 })}>
                  {handover.file.name}
                </p>
                {handover.file.sections.map((section, index) => (
                  <div
                    key={section.heading}
                    className="setup-sheet-block"
                    style={cssVars({ "--seq": 1 + index })}
                  >
                    <h3>{section.heading}</h3>
                    <ul className={section.checklist ? "is-checklist" : undefined}>
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </article>

              <div className="setup-rules">
                <div className="setup-rules-group" data-kind="dont">
                  <h3 style={cssVars({ "--seq": dontStart })}>{handover.rules.dontTitle}</h3>
                  <ul>
                    {handover.rules.dont.map((rule, index) => (
                      <li key={rule} style={cssVars({ "--seq": dontStart + 1 + index })}>
                        <X aria-hidden="true" size={16} />
                        <span>{richText(rule)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="setup-rules-group" data-kind="do">
                  <h3 style={cssVars({ "--seq": doStart })}>{handover.rules.doTitle}</h3>
                  <ul>
                    {handover.rules.do.map((rule, index) => (
                      <li key={rule} style={cssVars({ "--seq": doStart + 1 + index })}>
                        <Check aria-hidden="true" size={16} />
                        <span>{richText(rule)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </SetupReveal>
          </Container>
        </section>

        <section
          className="setup-section setup-section-muted setup-stage"
          id="automation"
          aria-labelledby="automation-heading"
        >
          <Container>
            <SetupHeading
              anchor="automation"
              eyebrow={automation.eyebrow}
              id="automation-heading"
              title={automation.title}
              intro={automation.intro}
            />

            <SetupReveal className="setup-automation-grid">
              <div className="setup-panel">
                <h3 translate="no">{automation.ci.title}</h3>
                <ol className="setup-feed" aria-label={automation.ci.aria}>
                  {automation.ci.events.map((event, index) => {
                    const Icon = ciIcons[event.state];

                    return (
                      <li
                        key={event.state}
                        data-state={event.state}
                        style={cssVars({ "--i": index })}
                      >
                        <span className="setup-feed-icon">
                          <Icon aria-hidden="true" size={18} />
                        </span>
                        <div>
                          <strong>{event.label}</strong>
                          <p>{event.text}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="setup-panel">
                <h3>
                  <span translate="no">{automation.personal.title}</span>
                  <span className="setup-chip">{automation.personal.tag}</span>
                </h3>
                <ul className="setup-routine" aria-label={automation.personal.aria}>
                  {automation.personal.tasks.map((task, index) => {
                    const Icon = routineIcons[index] ?? ListTodo;

                    return (
                      <li key={task} style={cssVars({ "--i": index })}>
                        <Icon aria-hidden="true" size={18} />
                        <span>{task}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </SetupReveal>
          </Container>
        </section>

        <section
          className="setup-section setup-desk-section"
          id="desk"
          aria-labelledby="desk-heading"
        >
          <Container>
            <SetupHeading anchor="desk" eyebrow={desk.eyebrow} id="desk-heading" title={desk.title} />

            <div className="setup-desk-grid">
              {desk.items.map((item, index) => {
                const Icon = deskIcons[index] ?? Laptop;

                return (
                  <article key={item.title}>
                    <Icon aria-hidden="true" size={21} />
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="setup-closing" aria-labelledby="setup-closing-heading">
          <Container>
            <blockquote className="setup-closing-quote">
              <h2 id="setup-closing-heading">{closing.title}</h2>
            </blockquote>
            <p>{closing.text}</p>
          </Container>
        </section>
      </main>
      <SiteFooter
        copy={{ ...ui.footer, brandAria: ui.header.brandAria, navigation: ui.header.navigation }}
        locale={locale}
        profile={profile}
        socialLinks={socialLinks}
      />
    </>
  );
}
