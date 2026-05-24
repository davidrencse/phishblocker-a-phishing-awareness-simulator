import { ScenarioCategory, ScenarioCompletionStatus, ScenarioDifficulty, ScenarioFilters, ScenarioSummary } from '../types';
import StatusView from './StatusView';

type ScenarioLibraryProps = {
  loading: boolean;
  error: string | null;
  scenarios: ScenarioSummary[];
  filters: ScenarioFilters;
  onChangeFilters: (filters: ScenarioFilters) => void;
  onRetry: () => void;
  onOpenScenario: (scenarioId: string) => void;
};

const difficulties: Array<{ value: ScenarioDifficulty | ''; label: string }> = [
  { value: '', label: 'All difficulties' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

const categories: Array<{ value: ScenarioCategory | ''; label: string }> = [
  { value: '', label: 'All categories' },
  { value: 'credential_theft', label: 'Credential theft' },
  { value: 'invoice_fraud', label: 'Invoice fraud' },
  { value: 'delivery_scam', label: 'Delivery scam' },
  { value: 'account_security', label: 'Account security' },
  { value: 'workplace_impersonation', label: 'Workplace impersonation' },
  { value: 'legitimate', label: 'Legitimate' }
];

const statuses: Array<{ value: ScenarioCompletionStatus; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'not_started', label: 'Not started' },
  { value: 'completed', label: 'Completed' }
];

export function ScenarioLibrary({
  loading,
  error,
  scenarios,
  filters,
  onChangeFilters,
  onRetry,
  onOpenScenario
}: ScenarioLibraryProps) {
  return (
    <div className="library-view">
      <section className="panel">
        <div className="panel__header">
          <h2>Scenario library</h2>
          <p>Filter simulated emails by difficulty, category, and completion status.</p>
        </div>

        <div className="filters-grid">
          <label className="form-field">
            <span>Difficulty</span>
            <select
              value={filters.difficulty ?? ''}
              onChange={(e) => onChangeFilters({ ...filters, difficulty: (e.target.value || null) as ScenarioDifficulty | null })}
            >
              {difficulties.map((item) => <option key={item.label} value={item.value}>{item.label}</option>)}
            </select>
          </label>

          <label className="form-field">
            <span>Category</span>
            <select
              value={filters.category ?? ''}
              onChange={(e) => onChangeFilters({ ...filters, category: (e.target.value || null) as ScenarioCategory | null })}
            >
              {categories.map((item) => <option key={item.label} value={item.value}>{item.label}</option>)}
            </select>
          </label>

          <label className="form-field">
            <span>Status</span>
            <select value={filters.status} onChange={(e) => onChangeFilters({ ...filters, status: e.target.value as ScenarioCompletionStatus })}>
              {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
        </div>
      </section>

      {loading ? <StatusView title="Loading scenarios" message="Retrieving scenario list from the backend." variant="loading" /> : null}
      {error ? <StatusView title="Unable to load scenarios" message={error} variant="error" actionLabel="Retry" onAction={onRetry} /> : null}
      {!loading && !error && scenarios.length === 0 ? (
        <StatusView title="No scenarios found" message="Try adjusting your filters to find available training emails." variant="empty" actionLabel="Reset filters" onAction={() => onChangeFilters({ difficulty: null, category: null, status: 'all' })} />
      ) : null}

      {!loading && !error && scenarios.length > 0 ? (
        <section className="scenario-grid">
          {scenarios.map((scenario) => (
            <article key={scenario.id} className="scenario-card">
              <div className="scenario-card__top">
                <span className={`pill pill--${scenario.difficulty}`}>{scenario.difficulty}</span>
                <span className="pill">{scenario.category.replace(/_/g, ' ')}</span>
              </div>
              <h3>{scenario.title}</h3>
              <p>{scenario.completed ? 'Completed previously' : 'Not started yet'}</p>
              <div className="scenario-card__footer">
                <span>Best score: {scenario.bestScore ?? '—'} / {scenario.maxScore}</span>
                <button className="button button--primary" onClick={() => onOpenScenario(scenario.id)}>
                  {scenario.completed ? 'Review again' : 'Inspect scenario'}
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}

export default ScenarioLibrary;
