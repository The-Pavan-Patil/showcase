import {
  Activity,
  Bell,
  BookOpenText,
  Brain,
  CalendarCheck2,
  Check,
  Cloud,
  Database,
  FileSpreadsheet,
  Globe2,
  Languages,
  Layers3,
  Radio,
  RotateCcw,
  Users,
} from "lucide-react";

import type { ProjectVisual as ProjectVisualType } from "@/lib/portfolio";
import { uiCopyByLocale, type UiCopy } from "@/lib/ui-copy";
import { cn } from "@/lib/utils";

export function ProjectVisual({
  copy = uiCopyByLocale.en.projectVisual,
  type,
  label,
  compact = false,
}: {
  copy?: UiCopy["projectVisual"];
  type: ProjectVisualType;
  label: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn("project-visual", `project-visual-${type}`, compact && "project-visual-compact")}
      role="img"
      aria-label={label}
    >
      {type === "sync" ? <SyncVisual copy={copy.sync} /> : null}
      {type === "web" ? <WebVisual copy={copy.web} /> : null}
      {type === "operations" ? <OperationsVisual copy={copy.operations} /> : null}
      {type === "learning" ? <LearningVisual copy={copy.learning} /> : null}
    </div>
  );
}

function SyncVisual({ copy }: { copy: UiCopy["projectVisual"]["sync"] }) {
  return (
    <div className="sync-diagram" aria-hidden="true">
      <div className="visual-topline">
        <span><Radio size={13} /> {copy.liveCollaboration}</span>
        <span className="status-dot">{copy.synced}</span>
      </div>
      <div className="device-row">
        <div className="phone-frame">
          <div className="phone-notch" />
          <p>{copy.today}</p>
          <div className="task-item"><Check size={11} /> {copy.designReview}</div>
          <div className="task-item active"><Bell size={11} /> {copy.nudgeAlex}</div>
          <div className="task-item"><Users size={11} /> {copy.teamSync}</div>
        </div>
        <div className="sync-core">
          <span className="pulse-ring"><Cloud size={18} /></span>
          <strong>PowerSync</strong>
          <small>{copy.offlineQueue}</small>
        </div>
        <div className="database-card">
          <Database size={20} />
          <strong>PostgreSQL</strong>
          <span>{copy.realtimeChanges}</span>
          <div className="data-bars"><i /><i /><i /></div>
        </div>
      </div>
    </div>
  );
}

function WebVisual({ copy }: { copy: UiCopy["projectVisual"]["web"] }) {
  return (
    <div className="browser-frame" aria-hidden="true">
      <div className="browser-bar">
        <span /><span /><span />
        <div>greenheart.com</div>
        <Globe2 size={13} />
      </div>
      <div className="browser-body">
        <div className="web-copy">
          <span className="mini-label">{copy.label}</span>
          <strong>{copy.headline}</strong>
          <p>{copy.description}</p>
          <div className="web-button">{copy.button}</div>
        </div>
        <div className="web-orbit">
          <div className="web-orbit-core"><Activity size={23} /></div>
          <span className="locale-badge"><Languages size={13} /> {copy.localeBadge}</span>
          <span className="apm-badge">{copy.apmBadge}</span>
        </div>
      </div>
    </div>
  );
}

function OperationsVisual({ copy }: { copy: UiCopy["projectVisual"]["operations"] }) {
  return (
    <div className="ops-frame" aria-hidden="true">
      <aside>
        <div className="ops-logo">S</div>
        <span className="active" /><span /><span /><span />
      </aside>
      <div className="ops-main">
        <div className="visual-topline">
          <span>{copy.overview}</span>
          <span className="status-dot">{copy.live}</span>
        </div>
        <div className="ops-stats">
          <div><Users size={15} /><strong>1,000+</strong><span>{copy.records}</span></div>
          <div><Check size={15} /><strong>{copy.multiSite}</strong><span>{copy.attendance}</span></div>
          <div><FileSpreadsheet size={15} /><strong>{copy.automated}</strong><span>{copy.payroll}</span></div>
        </div>
        <div className="ops-table">
          <div><b>{copy.workflow}</b><b>{copy.capability}</b><b>{copy.status}</b></div>
          <div><span>{copy.attendance}</span><span>{copy.multiSite}</span><em>{copy.tracked}</em></div>
          <div><span>{copy.overtime}</span><span>{copy.rules}</span><em>{copy.configured}</em></div>
          <div><span>{copy.payroll}</span><span>{copy.excel}</span><em>{copy.exportable}</em></div>
        </div>
      </div>
    </div>
  );
}

function LearningVisual({ copy }: { copy: UiCopy["projectVisual"]["learning"] }) {
  return (
    <div className="learning-frame" aria-hidden="true">
      <div className="visual-topline">
        <span><BookOpenText size={13} /> {copy.deck}</span>
        <span className="status-dot">{copy.due}</span>
      </div>
      <div className="learning-body">
        <section className="learning-card">
          <span>{copy.word}</span>
          <strong>{copy.meaning}</strong>
          <div className="learning-actions">
            <em>{copy.remember}</em>
            <em>{copy.gotIt}</em>
            <em>{copy.forgot}</em>
          </div>
        </section>
        <section className="learning-stack">
          <div>
            <Layers3 size={15} />
            <span>{copy.smartKanji}</span>
            <strong>{copy.reading}</strong>
          </div>
          <div>
            <Brain size={15} />
            <span>SM-2</span>
            <strong>{copy.protected}</strong>
          </div>
          <div>
            <RotateCcw size={15} />
            <span>{copy.queue}</span>
            <strong>FIFO</strong>
          </div>
        </section>
      </div>
      <div className="learning-timeline">
        <CalendarCheck2 size={14} />
        <i /><i /><i /><i />
      </div>
    </div>
  );
}
