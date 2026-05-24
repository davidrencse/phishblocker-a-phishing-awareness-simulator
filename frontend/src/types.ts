export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, string[]> | null;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: ApiError | null;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type ScenarioDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ScenarioCategory =
  | 'credential_theft'
  | 'invoice_fraud'
  | 'delivery_scam'
  | 'account_security'
  | 'workplace_impersonation'
  | 'legitimate';
export type ScenarioCompletionStatus = 'all' | 'not_started' | 'completed';
export type EmailClassification = 'phishing' | 'legitimate';
export type RedFlagCategory = 'sender' | 'link' | 'attachment' | 'language' | 'request' | 'metadata' | 'branding';

export type ScenarioFilters = {
  difficulty: ScenarioDifficulty | null;
  category: ScenarioCategory | null;
  status: ScenarioCompletionStatus;
};

export type ScenarioSummary = {
  id: string;
  title: string;
  difficulty: ScenarioDifficulty;
  category: ScenarioCategory;
  completed: boolean;
  bestScore: number | null;
  maxScore: number;
};

export type EmailLink = {
  id: string;
  label: string;
  displayUrl: string;
  actualUrl: string;
  isSuspicious: boolean;
};

export type EmailAttachment = {
  id: string;
  fileName: string;
  fileType: string;
  sizeLabel: string;
  isSuspicious: boolean;
};

export type EmailMetadataHint = {
  id: string;
  label: string;
  value: string;
  description: string;
};

export type SimulatedEmail = {
  fromName: string;
  fromEmail: string;
  replyToEmail: string | null;
  subject: string;
  receivedAt: string;
  bodyText: string;
  displayLinks: EmailLink[];
  attachments: EmailAttachment[];
  metadataHints: EmailMetadataHint[];
};

export type RedFlagOption = {
  id: string;
  label: string;
  description: string;
  category: RedFlagCategory;
};

export type ScenarioDetail = {
  id: string;
  title: string;
  difficulty: ScenarioDifficulty;
  category: ScenarioCategory;
  email: SimulatedEmail;
  availableRedFlags: RedFlagOption[];
  maxScore: number;
};

export type AttemptResult = {
  id: string;
  scenarioId: string;
  isClassificationCorrect: boolean;
  scoreAwarded: number;
  maxScore: number;
  submittedAt: string;
  feedbackPath: string;
};

export type AttemptFeedback = {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  classification: EmailClassification;
  correctClassification: EmailClassification;
  isClassificationCorrect: boolean;
  selectedRedFlags: RedFlagOption[];
  correctSelectedRedFlags: RedFlagOption[];
  incorrectSelectedRedFlags: RedFlagOption[];
  missedRedFlags: RedFlagOption[];
  scoreAwarded: number;
  maxScore: number;
  explanation: string;
  preventionTips: string[];
  submittedAt: string;
};

export type AttemptSummary = {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  scoreAwarded: number;
  maxScore: number;
  isClassificationCorrect: boolean;
  submittedAt: string;
};

export type ProgressSummary = {
  userId: string;
  completedScenarioCount: number;
  totalAttemptCount: number;
  averageScorePercent: number;
  classificationAccuracyPercent: number;
  bestScoreTotal: number;
  maxPossibleScoreTotal: number;
  recentStreak: number;
};

export type EducationalResource = {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  estimatedReadMinutes: number;
};

export type AuthMode = 'login' | 'register';

export type RouteName = 'home' | 'dashboard' | 'scenarios' | 'scenario' | 'feedback' | 'resources' | 'profile';

export type RouteState = {
  name: RouteName;
  params?: Record<string, string>;
};

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';
