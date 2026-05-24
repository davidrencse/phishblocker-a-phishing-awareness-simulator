import { apiRequest } from './client';
import { AttemptSummary, ProgressSummary } from '../types';

export const getProgressSummary = () =>
  apiRequest<{ summary: ProgressSummary }>({
    path: '/progress/summary'
  });

export const getRecentAttempts = (limit?: number) =>
  apiRequest<{ attempts: AttemptSummary[] }>({
    path: '/progress/recent-attempts',
    query: {
      limit
    }
  });
