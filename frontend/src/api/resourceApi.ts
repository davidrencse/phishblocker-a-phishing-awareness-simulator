import { apiRequest } from './client';
import { EducationalResource } from '../types';

export const getResources = () =>
  apiRequest<{ resources: EducationalResource[] }>({
    path: '/resources'
  });
