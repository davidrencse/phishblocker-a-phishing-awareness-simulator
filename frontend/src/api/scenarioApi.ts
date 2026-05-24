import { apiRequest } from './client';
import { AttemptFeedback, AttemptResult, EmailClassification, ScenarioDetail, ScenarioFilters, ScenarioSummary } from '../types';

export const listScenarios = (filters: ScenarioFilters) =>
  apiRequest<{ scenarios: ScenarioSummary[] }>({
    path: '/scenarios',
    query: {
      difficulty: filters.difficulty,
      category: filters.category,
      status: filters.status
    }
  });

export const getScenarioDetail = (scenarioId: string) =>
  apiRequest<{ scenario: ScenarioDetail }>({
    path: `/scenarios/${encodeURIComponent(scenarioId)}`
  });

export const submitScenarioAttempt = (input: {
  scenarioId: string;
  classification: EmailClassification;
  selectedRedFlagIds: string[];
  inspectionNotes?: string;
}) =>
  apiRequest<{ attempt: AttemptResult }>({
    path: `/scenarios/${encodeURIComponent(input.scenarioId)}/attempts`,
    method: 'POST',
    body: {
      classification: input.classification,
      selectedRedFlagIds: input.selectedRedFlagIds,
      inspectionNotes: input.inspectionNotes || undefined
    }
  });

export const getAttemptFeedback = (attemptId: string) =>
  apiRequest<{ attempt: AttemptFeedback }>({
    path: `/attempts/${encodeURIComponent(attemptId)}`
  });
