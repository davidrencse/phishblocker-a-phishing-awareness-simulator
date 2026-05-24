import { FormEvent } from 'react';
import { EmailClassification, RedFlagOption, ScenarioDetail } from '../types';
import StatusView from './StatusView';

type ScenarioInspectorProps = {
  loading: boolean;
  error: string | null;
  scenario: ScenarioDetail | null;
  selectedRedFlagIds: string[];
  classification: EmailClassification | null;
  inspectionNotes: string;
  validationError: string | null;
  submitting: boolean;
  submitError: string | null;
  onRetry: () => void;
  onToggleRedFlag: (redFlagId: string) => void;
  onClassificationChange: (classification: EmailClassification) => void;
  onInspectionNotesChange: (value: string) => void;
  onSubmit: () => void;
};

const groupedFlags = (flags: RedFlagOption[]) => {
  return flags.reduce<Record<string, RedFlagOption[]>>((acc, flag) => {
    acc[flag.category] = acc[flag.category] || [];
    acc[flag.category].push(flag);
    return acc;
  }, {});
};

export function ScenarioInspector(props: ScenarioInspectorProps) {
  const {
    loading,
    error,
    scenario,
    selectedRedFlagIds,
    classification,
    inspectionNotes,
    validationError,
    submitting,
    submitError,
    onRetry,
    onToggleRedFlag,
    onClassificationChange,
    onInspectionNotesChange,
    onSubmit
  } = props;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  if (loading) {
    return <StatusView title="Loading scenario" message="Fetching simulated email details and available red flags." variant="loading" />;
  }

  if (error) {
    return <StatusView title="Scenario unavailable" message={error} variant="error" actionLabel="Retry" onAction={onRetry} />;
  }

  if (!scenario) {
    return <StatusView title="Scenario not found" message="The requested training scenario could not be loaded." variant="empty" actionLabel="Retry" onAction={onRetry} />;
  }

  const grouped = groupedFlags(scenario.availableRedFlags);

  return (
    <div className="inspector-layout">
      <section className="panel email-panel">
        <div className="panel__header">
          <h2>{scenario.title}</h2>
          <p>{scenario.difficulty} · {scenario.category.replace(/_/g, ' ')} · Max score {scenario.maxScore}</p>
        </div>

        <div className="email-header-grid">
          <div><strong>From</strong><span>{scenario.email.fromName} &lt;{scenario.email.fromEmail}&gt;</span></div>
          <div><strong>Reply-To</strong><span>{scenario.email.replyToEmail || 'Not provided'}</span></div>
          <div><strong>Subject</strong><span>{scenario.email.subject}</span></div>
          <div><strong>Received</strong><span>{new Date(scenario.email.receivedAt).toLocaleString()}</span></div>
        </div>

        <article className="email-body">
          {scenario.email.bodyText.split('\n').map((line, index) => (
            <p key={`${index}-${line.slice(0, 12)}`}>{line || ' '}</p>
          ))}
        </article>

        <div className="email-sections">
          <section>
            <h3>Links</h3>
            {scenario.email.displayLinks.length === 0 ? <p className="muted">No links shown in this email.</p> : (
              <ul className="detail-list">
                {scenario.email.displayLinks.map((link) => (
                  <li key={link.id}>
                    <strong>{link.label}</strong>
                    <span>Displayed: {link.displayUrl}</span>
                    <span>Destination preview: {link.actualUrl}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3>Attachments</h3>
            {scenario.email.attachments.length === 0 ? <p className="muted">No attachments present.</p> : (
              <ul className="detail-list">
                {scenario.email.attachments.map((attachment) => (
                  <li key={attachment.id}>
                    <strong>{attachment.fileName}</strong>
                    <span>{attachment.fileType}</span>
                    <span>{attachment.sizeLabel}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3>Metadata hints</h3>
            {scenario.email.metadataHints.length === 0 ? <p className="muted">No metadata hints provided.</p> : (
              <ul className="detail-list">
                {scenario.email.metadataHints.map((hint) => (
                  <li key={hint.id}>
                    <strong>{hint.label}</strong>
                    <span>{hint.value}</span>
                    <span>{hint.description}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </section>

      <form className="panel workflow-panel" onSubmit={handleSubmit}>
        <div className="panel__header">
          <h2>Your inspection</h2>
          <p>Select all suspicious indicators you notice, then classify the email.</p>
        </div>

        <div className="flag-groups">
          {Object.entries(grouped).map(([category, flags]) => (
            <section key={category} className="flag-group">
              <h3>{category}</h3>
              <div className="flag-options">
                {flags.map((flag) => {
                  const checked = selectedRedFlagIds.includes(flag.id);
                  return (
                    <label key={flag.id} className={`flag-option${checked ? ' flag-option--selected' : ''}`}>
                      <input type="checkbox" checked={checked} onChange={() => onToggleRedFlag(flag.id)} />
                      <span>
                        <strong>{flag.label}</strong>
                        <small>{flag.description}</small>
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <section className="classification-box">
          <h3>Classification</h3>
          <div className="classification-actions">
            <button
              type="button"
              className={`button ${classification === 'phishing' ? 'button--primary' : 'button--secondary'}`}
              onClick={() => onClassificationChange('phishing')}
            >
              Mark as phishing
            </button>
            <button
              type="button"
              className={`button ${classification === 'legitimate' ? 'button--primary' : 'button--secondary'}`}
              onClick={() => onClassificationChange('legitimate')}
            >
              Mark as legitimate
            </button>
          </div>
        </section>

        <label className="form-field">
          <span>Inspection notes</span>
          <textarea
            value={inspectionNotes}
            onChange={(e) => onInspectionNotesChange(e.target.value)}
            rows={5}
            maxLength={1000}
            placeholder="Record why you think the message is safe or suspicious."
          />
        </label>

        {validationError ? <div className="api-error">{validationError}</div> : null}
        {submitError ? <div className="api-error">{submitError}</div> : null}

        <button className="button button--primary" type="submit" disabled={submitting}>
          {submitting ? 'Submitting attempt...' : 'Submit attempt'}
        </button>
      </form>
    </div>
  );
}

export default ScenarioInspector;
