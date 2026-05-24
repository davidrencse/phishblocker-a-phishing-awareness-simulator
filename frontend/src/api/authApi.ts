import { apiRequest } from './client';
import { PublicUser } from '../types';

export const registerUser = (input: { name: string; email: string; password: string }) =>
  apiRequest<{ user: PublicUser }>({
    path: '/auth/register',
    method: 'POST',
    body: input
  });

export const loginUser = (input: { email: string; password: string }) =>
  apiRequest<{ user: PublicUser }>({
    path: '/auth/login',
    method: 'POST',
    body: input
  });

export const logoutUser = () =>
  apiRequest<{ loggedOut: boolean }>({
    path: '/auth/logout',
    method: 'POST',
    body: {}
  });

export const getSession = () =>
  apiRequest<{ user: PublicUser | null }>({
    path: '/auth/session'
  });
