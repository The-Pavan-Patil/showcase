import {
  Activity,
  Bell,
  Check,
  Cloud,
  Database,
  FileSpreadsheet,
  Globe2,
  Languages,
  Radio,
  Users,
} from "lucide-react";

import type { ProjectVisual as ProjectVisualType } from "@/lib/portfolio";
import { cn } from "@/lib/utils";

export function ProjectVisual({
  type,
  label,
  compact = false,
}: {
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
      {type === "sync" ? <SyncVisual /> : null}
      {type === "web" ? <WebVisual /> : null}
      {type === "operations" ? <OperationsVisual /> : null}
    </div>
  );
}

function SyncVisual() {
  return (
    <div className="sync-diagram" aria-hidden="true">
      <div className="visual-topline">
        <span><Radio size={13} /> Live collaboration</span>
        <span className="status-dot">Synced</span>
      </div>
      <div className="device-row">
        <div className="phone-frame">
          <div className="phone-notch" />
          <p>Today</p>
          <div className="task-item"><Check size={11} /> Design review</div>
          <div className="task-item active"><Bell size={11} /> Nudge Alex</div>
          <div className="task-item"><Users size={11} /> Team sync</div>
        </div>
        <div className="sync-core">
          <span className="pulse-ring"><Cloud size={18} /></span>
          <strong>PowerSync</strong>
          <small>offline queue · 03</small>
        </div>
        <div className="database-card">
          <Database size={20} />
          <strong>PostgreSQL</strong>
          <span>Realtime changes</span>
          <div className="data-bars"><i /><i /><i /></div>
        </div>
      </div>
    </div>
  );
}

function WebVisual() {
  return (
    <div className="browser-frame" aria-hidden="true">
      <div className="browser-bar">
        <span /><span /><span />
        <div>greenheart.com</div>
        <Globe2 size={13} />
      </div>
      <div className="browser-body">
        <div className="web-copy">
          <span className="mini-label">PHILIPS GREENHEART</span>
          <strong>Multilingual product experience.</strong>
          <p>Region-ready content on a tested component foundation.</p>
          <div className="web-button">Explore content</div>
        </div>
        <div className="web-orbit">
          <div className="web-orbit-core"><Activity size={23} /></div>
          <span className="locale-badge"><Languages size={13} /> EN · JP</span>
          <span className="apm-badge">APM · healthy</span>
        </div>
      </div>
    </div>
  );
}

function OperationsVisual() {
  return (
    <div className="ops-frame" aria-hidden="true">
      <aside>
        <div className="ops-logo">S</div>
        <span className="active" /><span /><span /><span />
      </aside>
      <div className="ops-main">
        <div className="visual-topline">
          <span>Workforce overview</span>
          <span className="status-dot">Live</span>
        </div>
        <div className="ops-stats">
          <div><Users size={15} /><strong>1,000+</strong><span>Records</span></div>
          <div><Check size={15} /><strong>Multi-site</strong><span>Attendance</span></div>
          <div><FileSpreadsheet size={15} /><strong>Automated</strong><span>Payroll</span></div>
        </div>
        <div className="ops-table">
          <div><b>Workflow</b><b>Capability</b><b>Status</b></div>
          <div><span>Attendance</span><span>Multi-site</span><em>Tracked</em></div>
          <div><span>Overtime</span><span>Rules</span><em>Configured</em></div>
          <div><span>Payroll</span><span>Excel</span><em>Exportable</em></div>
        </div>
      </div>
    </div>
  );
}
