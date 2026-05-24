import { AttemptSummary, ProgressSummary } from '../types';
import StatusView from './StatusView';

type DashboardProps = {
  loading: boolean;
  error: string | null;
  summary: ProgressSummary | null;
  recentAttempts: AttemptSummary[];
  onRetry: () => void;
  onOpenAttempt: (attemptId: string) => void;
  onOpenScenarios: () => void;
};

const percent = (value: number) => `${Math.round(value)}%`;

export function Dashboard({
  loading,
  error,
  summary,
  recentAttempts,
  onRetry,
  onOpenAttempt,
  onOpenScenarios
}: DashboardProps) {
  if (loading) {
    return <StatusView title="Loading dashboard" message="Fetching your learning progress and recent activity." variant="loading" />;
  }

  if (error) {
    return <StatusView title="Dashboard unavailable" message={error} variant="error" actionLabel="Retry" onAction={onRetry} />;
  }

  if (!summary) {
    return <StatusView title="No dashboard data" message="Your progress summary is not available yet." variant="empty" actionLabel="Reload" onAction={onRetry} />;
  }

  return (
    <div className="dashboard">
      <section className="stats-grid">
        <article className="stat-card"><h3>Completed scenarios</h3><strong>{summary.completedScenarioCount}</strong></article>
        <article className="stat-card"><h3>Total attempts</h3><strong>{summary.totalAttemptCount}</strong></article>
        <article className="stat-card"><h3>Average score</h3><strong>{percent(summary.averageScorePercent)}</strong></article>
        <article className="stat-card"><h3>Classification accuracy</h3><strong>{percent(summary.classificationAccuracyPercent)}</strong></article>
        <article className="stat-card"><h3>Best score total</h3><strong>{summary.bestScoreTotal} / {summary.maxPossibleScoreTotal}</strong></article>
        <article className="stat-card"><h3>Recent streak</h3><strong>{summary.recentStreak}</strong></article>
      </section>

      <section className="panel">
        <div className="panel__header panel__header--row">
          <div>
            <h2>Recent attempts</h2>
            <p>Review your latest feedback and continue practicing.</p>
          </div>
          <button className="button button--secondary" onClick={onOpenScenarios}>Open scenario library</button>
        </div>

        {recentAttempts.length === 0 ? (
          <StatusView title="No attempts yet" message="Start a scenario to receive scored feedback and track progress." variant="empty" actionLabel="Browse scenarios" onAction={onOpenScenarios} />
        ) : (
          <div className="attempt-list">
            {recentAttempts.map((attempt) => (
              <button key={attempt.id} className="attempt-item" onClick={() => onOpenAttempt(attempt.id)}>
                <div>
                  <strong>{attempt.scenarioTitle}</strong>
                  <div className="attempt-item__meta">{new Date(attempt.submittedAt).toLocaleString()}</div>
                </div>
                <div className="attempt-item__score">
                  <span>{attempt.scoreAwarded} / {attempt.maxScore}</span>
                  <small>{attempt.isClassificationCorrect ? 'Correct classification' : 'Incorrect classification'}</small>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
