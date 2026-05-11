import type { AuditReport, RiskGrade } from "@/shared/audit-types";
import { RISK_GRADE_LABEL } from "@/shared/audit-types";
import { siteUrl } from "@/shared/api";

const GRADE_CLASS: Record<RiskGrade, string> = {
  low: "bl-grade-low",
  moderate: "bl-grade-moderate",
  elevated: "bl-grade-elevated",
  high: "bl-grade-high",
  critical: "bl-grade-critical",
};

interface ResultPanelProps {
  report: AuditReport;
  page: { title: string; pageUrl: string } | null;
  onReset: () => void;
}

export function ResultPanel({ report, page, onReset }: ResultPanelProps) {
  const fullAuditUrl = siteUrl(`/audit?source=extension`);

  return (
    <div className="bl-result">
      <div className="bl-result-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="bl-label" style={{ marginBottom: 4 }}>
            {report.documentType} · {report.jurisdictionName}
          </p>
          {page?.title && (
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "var(--bl-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={page.title}
            >
              {page.title}
            </p>
          )}
        </div>
        <span className={`bl-grade ${GRADE_CLASS[report.overallRiskGrade]}`}>
          {RISK_GRADE_LABEL[report.overallRiskGrade]}
        </span>
      </div>

      <p className="bl-summary">{report.oneLineSummary}</p>

      {report.redFlags.length > 0 && (
        <section className="bl-section">
          <h3 className="bl-section-title">Red flags</h3>
          <ul className="bl-list">
            {report.redFlags.slice(0, 4).map((flag, index) => (
              <li key={`${flag.title}-${index}`} className="bl-list-item">
                <div className="bl-list-item-title">{flag.title}</div>
                <div>{flag.why}</div>
                {flag.pushback && <div className="bl-list-item-pushback">“{flag.pushback}”</div>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.positives.length > 0 && (
        <section className="bl-section">
          <h3 className="bl-section-title">Positives</h3>
          <ul className="bl-list">
            {report.positives.slice(0, 3).map((item, index) => (
              <li key={`${item.title}-${index}`} className="bl-list-item">
                <div className="bl-list-item-title">{item.title}</div>
                <div>{item.why}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.keyClausesToPushBackOn.length > 0 && (
        <section className="bl-section">
          <h3 className="bl-section-title">Pushback lines</h3>
          <ul className="bl-list">
            {report.keyClausesToPushBackOn.slice(0, 3).map((clause, index) => (
              <li key={`${clause.clause}-${index}`} className="bl-list-item">
                <div className="bl-list-item-title">{clause.clause}</div>
                <div className="bl-list-item-pushback">“{clause.pushback}”</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.askLawyerIfTriggers.length > 0 && (
        <section className="bl-section">
          <h3 className="bl-section-title">Talk to a lawyer if…</h3>
          <ul className="bl-list">
            {report.askLawyerIfTriggers.slice(0, 3).map((trigger, index) => (
              <li key={`${trigger.trigger}-${index}`} className="bl-list-item">
                <div className="bl-list-item-title">{trigger.trigger}</div>
                <div>{trigger.why}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="bl-actions">
        <a className="bl-link-button" href={fullAuditUrl} target="_blank" rel="noreferrer">
          Open full audit on BasicLaw →
        </a>
        <button className="bl-button bl-button-secondary" onClick={onReset}>
          Audit another page
        </button>
      </div>
    </div>
  );
}
