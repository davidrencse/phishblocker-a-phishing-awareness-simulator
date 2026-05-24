import { useEffect, useMemo, useState } from 'react';
import './index.css';
import Header from './components/Header';
import AuthPanel from './components/AuthPanel';
import Dashboard from './components/Dashboard';
import ScenarioLibrary from './components/ScenarioLibrary';
import ScenarioInspector from './components/ScenarioInspector';
import FeedbackPanel from './components/FeedbackPanel';
import ResourceCenter from './components/ResourceCenter';
import StatusView from './components/StatusView';
import { getSession, loginUser, logoutUser, registerUser } from './api/authApi';
import { getProgressSummary, getRecentAttempts } from './api/progressApi';
import { getResources } from './api/resourceApi';
import { getAttemptFeedback, getScenarioDetail, listScenarios, submitScenarioAttempt } from './api/scenarioApi';
import {
  ApiError,
  AttemptFeedback,
  AttemptSummary,
  AuthMode,
  EducationalResource,
  EmailClassification,
  ProgressSummary,
  PublicUser,
  RouteState,
  ScenarioDetail,
  ScenarioFilters,
  ScenarioSummary
} from './types';

const defaultFilters: ScenarioFilters = {
  difficulty: null,
  category: null,
  status: 'all'
};

function parseHash(): RouteState {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  const parts = hash.split('/').filter(Boolean);

  if (parts.length === 0) return { name: 'home' };
  if (parts[0] === 'dashboard') return { name: 'dashboard' };
  if (parts[0] === 'scenarios' && parts[1]) return { name: 'scenario', params: { scenarioId: parts[1] } };
  if (parts[0] === 'scenarios') return { name: 'scenarios' };
  if (parts[0] === 'attempts' && parts[1] && parts[2] === 'feedback') return { name: 'feedback', params: { attemptId: parts[1] } };
  if (parts[0] === 'resources') return { name: 'resources' };
  if (parts[0] === 'profile') return { name: 'profile' };
  return { name: 'home' };
}

function toHash(route: RouteState) {
  switch (route.name) {
    case 'home': return '#/';
    case 'dashboard': return '#/dashboard';
    case 'scenarios': return '#/scenarios';
    case 'scenario': return `#/scenarios/${route.params?.scenarioId ?? ''}`;
    case 'feedback': return `#/attempts/${route.params?.attemptId ?? ''}/feedback`;
    case 'resources': return '#/resources';
    case 'profile': return '#/profile';
  }
}

function App() {
  const [route, setRoute] = useState<RouteState>(parseHash());
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [sessionLoading, setSessionLoading] = useState(true);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<ApiError | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<AttemptSummary[]>([]);

  const [scenarioFilters, setScenarioFilters] = useState<ScenarioFilters>(defaultFilters);
  const [scenariosLoading, setScenariosLoading] = useState(false);
  const [scenariosError, setScenariosError] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([]);

  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [scenarioError, setScenarioError] = useState<string | null>(null);
  const [scenario, setScenario] = useState<ScenarioDetail | null>(null);
  const [selectedRedFlagIds, setSelectedRedFlagIds] = useState<string[]>([]);
  const [classification, setClassification] = useState<EmailClassification | null>(null);
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [attemptValidationError, setAttemptValidationError] = useState<string | null>(null);
  const [attemptSubmitting, setAttemptSubmitting] = useState(false);
  const [attemptSubmitError, setAttemptSubmitError] = useState<string | null>(null);

  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<AttemptFeedback | null>(null);

  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [resourcesError, setResourcesError] = useState<string | null>(null);
  const [resources, setResources] = useState<EducationalResource[]>([]);

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    if (!window.location.hash) {
      window.location.hash = '#/';
    }
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (nextRoute: RouteState) => {
    window.location.hash = toHash(nextRoute);
  };

  const requireAuthNavigate = (nextRoute: RouteState) => {
    if (!user) {
      setAuthMode('login');
      navigate({ name: 'home' });
      return;
    }
    navigate(nextRoute);
  };

  const normalizeMessage = (error: unknown) => {
    const apiError = error as ApiError;
    return apiError?.message || 'An unexpected error occurred.';
  };

  const loadSession = async () => {
    setSessionLoading(true);
    try {
      const data = await getSession();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    void loadSession();
  }, []);

  const loadDashboard = async () => {
    if (!user) return;
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const [summaryResponse, attemptsResponse] = await Promise.all([
        getProgressSummary(),
        getRecentAttempts(5)
      ]);
      setSummary(summaryResponse.summary);
      setRecentAttempts(attemptsResponse.attempts);
    } catch (error) {
      setDashboardError(normalizeMessage(error));
    } finally {
      setDashboardLoading(false);
    }
  };

  const loadScenarios = async (filters: ScenarioFilters) => {
    if (!user) return;
    setScenariosLoading(true);
    setScenariosError(null);
    try {
      const response = await listScenarios(filters);
      setScenarios(response.scenarios);
    } catch (error) {
      setScenariosError(normalizeMessage(error));
    } finally {
      setScenariosLoading(false);
    }
  };

  const loadScenario = async (scenarioId: string) => {
    if (!user) return;
    setScenarioLoading(true);
    setScenarioError(null);
    setScenario(null);
    setSelectedRedFlagIds([]);
    setClassification(null);
    setInspectionNotes('');
    setAttemptValidationError(null);
    setAttemptSubmitError(null);
    try {
      const response = await getScenarioDetail(scenarioId);
      setScenario(response.scenario);
    } catch (error) {
      setScenarioError(normalizeMessage(error));
    } finally {
      setScenarioLoading(false);
    }
  };

  const loadFeedback = async (attemptId: string) => {
    if (!user) return;
    setFeedbackLoading(true);
    setFeedbackError(null);
    setFeedback(null);
    try {
      const response = await getAttemptFeedback(attemptId);
      setFeedback(response.attempt);
    } catch (error) {
      setFeedbackError(normalizeMessage(error));
    } finally {
      setFeedbackLoading(false);
    }
  };

  const loadResources = async () => {
    setResourcesLoading(true);
    setResourcesError(null);
    try {
      const response = await getResources();
      setResources(response.resources);
    } catch (error) {
      setResourcesError(normalizeMessage(error));
    } finally {
      setResourcesLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionLoading && user && route.name === 'home') {
      navigate({ name: 'dashboard' });
    }
  }, [sessionLoading, user, route.name]);

  useEffect(() => {
    if (!sessionLoading && !user && route.name !== 'home') {
      navigate({ name: 'home' });
    }
  }, [sessionLoading, user, route.name]);

  useEffect(() => {
    if (!user) return;
    if (route.name === 'dashboard' || route.name === 'profile') {
      void loadDashboard();
    }
  }, [user, route.name]);

  useEffect(() => {
    if (!user) return;
    if (route.name === 'scenarios') {
      void loadScenarios(scenarioFilters);
    }
  }, [user, route.name, scenarioFilters]);

  useEffect(() => {
    if (!user) return;
    if (route.name === 'scenario' && route.params?.scenarioId) {
      void loadScenario(route.params.scenarioId);
    }
  }, [user, route.name, route.params?.scenarioId]);

  useEffect(() => {
    if (route.name === 'resources') {
      void loadResources();
    }
  }, [route.name]);

  useEffect(() => {
    if (!user) return;
    if (route.name === 'feedback' && route.params?.attemptId) {
      void loadFeedback(route.params.attemptId);
    }
  }, [user, route.name, route.params?.attemptId]);

  const handleAuthSubmit = async (values: { name?: string; email: string; password: string }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = authMode === 'login'
        ? await loginUser({ email: values.email, password: values.password })
        : await registerUser({ name: values.name || '', email: values.email, password: values.password });
      setUser(response.user);
      navigate({ name: 'dashboard' });
    } catch (error) {
      setAuthError(error as ApiError);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setSummary(null);
      setRecentAttempts([]);
      setScenarios([]);
      setScenario(null);
      setFeedback(null);
      navigate({ name: 'home' });
    } finally {
      setLogoutLoading(false);
    }
  };

  const toggleRedFlag = (redFlagId: string) => {
    setSelectedRedFlagIds((current) => current.includes(redFlagId)
      ? current.filter((id) => id !== redFlagId)
      : [...current, redFlagId]);
  };

  const submitAttempt = async () => {
    if (!scenario) {
      setAttemptValidationError('Scenario detail is not loaded yet.');
      return;
    }
    if (!classification) {
      setAttemptValidationError('Choose whether the email is phishing or legitimate before submitting.');
      return;
    }

    setAttemptValidationError(null);
    setAttemptSubmitError(null);
    setAttemptSubmitting(true);
    try {
      const response = await submitScenarioAttempt({
        scenarioId: scenario.id,
        classification,
        selectedRedFlagIds,
        inspectionNotes
      });
      navigate({ name: 'feedback', params: { attemptId: response.attempt.id } });
    } catch (error) {
      setAttemptSubmitError(normalizeMessage(error));
    } finally {
      setAttemptSubmitting(false);
    }
  };

  const profileContent = useMemo(() => {
    if (dashboardLoading) {
      return <StatusView title="Loading profile" message="Retrieving your profile and progress." variant="loading" />;
    }
    if (dashboardError) {
      return <StatusView title="Profile unavailable" message={dashboardError} variant="error" actionLabel="Retry" onAction={loadDashboard} />;
    }
    if (!user) {
      return <StatusView title="No active session" message="Sign in to view your profile." variant="empty" />;
    }

    return (
      <section className="panel">
        <div className="panel__header">
          <h2>Profile</h2>
          <p>Account and training overview.</p>
        </div>
        <div className="profile-grid">
          <div><strong>Name</strong><span>{user.name}</span></div>
          <div><strong>Email</strong><span>{user.email}</span></div>
          <div><strong>Member since</strong><span>{new Date(user.createdAt).toLocaleDateString()}</span></div>
          <div><strong>Completed scenarios</strong><span>{summary?.completedScenarioCount ?? '—'}</span></div>
          <div><strong>Total attempts</strong><span>{summary?.totalAttemptCount ?? '—'}</span></div>
          <div><strong>Recent streak</strong><span>{summary?.recentStreak ?? '—'}</span></div>
        </div>
      </section>
    );
  }, [dashboardError, dashboardLoading, summary, user]);

  if (sessionLoading) {
    return <div className="app-shell"><StatusView title="Starting PhishBlocker" message="Checking your authenticated session." variant="loading" /></div>;
  }

  return (
    <div className="app-shell">
      <Header
        user={user}
        currentRoute={route}
        onNavigate={(next) => (next.name === 'home' ? navigate(next) : requireAuthNavigate(next))}
        onLogout={handleLogout}
        logoutLoading={logoutLoading}
      />

      <main className="app-main">
        {!user ? (
          <div className="landing-layout">
            <section className="hero panel">
              <div className="panel__header">
                <h1>Train yourself to spot phishing without risk.</h1>
                <p>
                  PhishBlocker provides fictional email simulations, guided red-flag inspection, server-scored feedback,
                  and progress tracking to build safer email habits.
                </p>
              </div>
              <ul className="tips-list">
                <li>All scenarios are educational simulations.</li>
                <li>No real phishing emails are sent.</li>
                <li>Inspect senders, links, urgency, attachments, and requests.</li>
                <li>Receive immediate feedback and learning tips after every attempt.</li>
              </ul>
            </section>

            <AuthPanel mode={authMode} loading={authLoading} error={authError} onSubmit={handleAuthSubmit} onModeChange={setAuthMode} />
          </div>
        ) : route.name === 'dashboard' ? (
          <Dashboard
            loading={dashboardLoading}
            error={dashboardError}
            summary={summary}
            recentAttempts={recentAttempts}
            onRetry={loadDashboard}
            onOpenAttempt={(attemptId) => navigate({ name: 'feedback', params: { attemptId } })}
            onOpenScenarios={() => navigate({ name: 'scenarios' })}
          />
        ) : route.name === 'scenarios' ? (
          <ScenarioLibrary
            loading={scenariosLoading}
            error={scenariosError}
            scenarios={scenarios}
            filters={scenarioFilters}
            onChangeFilters={setScenarioFilters}
            onRetry={() => loadScenarios(scenarioFilters)}
            onOpenScenario={(scenarioId) => navigate({ name: 'scenario', params: { scenarioId } })}
          />
        ) : route.name === 'scenario' ? (
          <ScenarioInspector
            loading={scenarioLoading}
            error={scenarioError}
            scenario={scenario}
            selectedRedFlagIds={selectedRedFlagIds}
            classification={classification}
            inspectionNotes={inspectionNotes}
            validationError={attemptValidationError}
            submitting={attemptSubmitting}
            submitError={attemptSubmitError}
            onRetry={() => route.params?.scenarioId && loadScenario(route.params.scenarioId)}
            onToggleRedFlag={toggleRedFlag}
            onClassificationChange={setClassification}
            onInspectionNotesChange={setInspectionNotes}
            onSubmit={submitAttempt}
          />
        ) : route.name === 'feedback' ? (
          <FeedbackPanel
            loading={feedbackLoading}
            error={feedbackError}
            attempt={feedback}
            onRetry={() => route.params?.attemptId && loadFeedback(route.params.attemptId)}
            onOpenScenarios={() => navigate({ name: 'scenarios' })}
          />
        ) : route.name === 'resources' ? (
          <ResourceCenter loading={resourcesLoading} error={resourcesError} resources={resources} onRetry={loadResources} />
        ) : route.name === 'profile' ? (
          profileContent
        ) : (
          <StatusView title="Page not found" message="The requested page does not exist." variant="empty" actionLabel="Go to dashboard" onAction={() => navigate({ name: 'dashboard' })} />
        )}
      </main>
    </div>
  );
}

export default App;
