import { AttemptFeedback } from '../types';
import StatusView from './StatusView';

type FeedbackPanelProps = {
  loading: boolean;
  error: string | null;
  attempt: AttemptFeedback | null;
  onRetry: () => void;
  onOpenScenarios: () => void;
};

const FlagList = ({ title, items }: { title: string; items: AttemptFeedback['selectedRedFlags'] }) => (
  <section className="feedback-group">
    <h3>{title}</h3>
    {items.length === 0 ? <p className="muted">None.</p> : (
      <ul className="detail-list">
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.label}</strong>
            <span>{item.description}</span>
          </li>
        ))}
      </ul>
    )}
  </section>
);

export function FeedbackPanel({ loading, error, attempt, onRetry, onOpenScenarios }: FeedbackPanelProps) {
  if (loading) {
    return <StatusView title="Loading feedback" message="Retrieving your scored attempt and explanation." variant="loading" />;
  }

  if (error) {
    return <StatusView title="Unable to load feedback" message={error} variant="error" actionLabel="Retry" onAction={onRetry} />;
  }

  if (!attempt) {
    return <StatusView title="No feedback found" message="This attempt feedback is unavailable." variant="empty" actionLabel="Open scenarios" onAction={onOpenScenarios} />;
  }

  return (
    <div className="feedback-layout">
      <section className="panel">
        <div className="panel__header">
          <h2>{attempt.scenarioTitle}</h2>
          <p>Submitted {new Date(attempt.submittedAt).toLocaleString()}</p>
        </div>

        <div className="stats-grid">
          <article className="stat-card"><h3>Score</h3><strong>{attempt.scoreAwarded} / {attempt.maxScore}</strong></article>
          <article className="stat-card"><h3>Your classification</h3><strong>{attempt.classification}</strong></article>
          <article className="stat-card"><h3>Correct classification</h3><strong>{attempt.correctClassification}</strong></article>
          <article className="stat-card"><h3>Outcome</h3><strong>{attempt.isClassificationCorrect ? 'Correct' : 'Needs review'}</strong></article>
        </div>
      </section>

      <section className="feedback-grid">
        <FlagList title="Selected red flags" items={attempt.selectedRedFlags} />
        <FlagList title="Correctly selected" items={attempt.correctSelectedRedFlags} />
        <FlagList title="Incorrectly selected" items={attempt.incorrectSelectedRedFlags} />
        <FlagList title="Missed red flags" items={attempt.missedRedFlags} />
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Explanation</h2>
        </div>
        <p>{attempt.explanation}</p>
      </section>

      <section className="panel">
        <div className="panel__header panel__header--row">
          <div>
            <h2>Prevention tips</h2>
            <p>Use these defensive habits when reviewing real-world messages.</p>
          </div>
          <button className="button button--secondary" onClick={onOpenScenarios}>Try another scenario</button>
        </div>
        {attempt.preventionTips.length === 0 ? (
          <StatusView title="No prevention tips available" message="The backend did not return prevention guidance for this attempt." variant="empty" />
        ) : (
          <ul className="tips-list">
            {attempt.preventionTips.map((tip, index) => <li key={`${index}-${tip.slice(0, 12)}`}>{tip}</li>)}
          </ul>
        )}
      </section>
    </div>
  );
}

export default FeedbackPanel;
