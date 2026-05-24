import { FormEvent, useMemo, useState } from 'react';
import { ApiError, AuthMode } from '../types';

type AuthPanelProps = {
  mode: AuthMode;
  loading: boolean;
  error: ApiError | null;
  onSubmit: (values: { name?: string; email: string; password: string }) => Promise<void> | void;
  onModeChange: (mode: AuthMode) => void;
};

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthPanel({ mode, loading, error, onSubmit, onModeChange }: AuthPanelProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const title = useMemo(() => (mode === 'login' ? 'Sign in' : 'Create an account'), [mode]);

  const validate = () => {
    const nextErrors: FieldErrors = {};

    if (mode === 'register' && !name.trim()) {
      nextErrors.name = 'Name is required.';
    }
    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!emailPattern.test(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    await onSubmit({
      name: mode === 'register' ? name.trim() : undefined,
      email: email.trim(),
      password
    });
  };

  return (
    <section className="panel auth-panel">
      <div className="panel__header">
        <h2>{title}</h2>
        <p>Practice recognizing phishing safely with simulated training emails.</p>
      </div>

      <div className="auth-switch" role="tablist" aria-label="Authentication mode">
        <button
          type="button"
          className={`auth-switch__button${mode === 'login' ? ' auth-switch__button--active' : ''}`}
          onClick={() => onModeChange('login')}
        >
          Login
        </button>
        <button
          type="button"
          className={`auth-switch__button${mode === 'register' ? ' auth-switch__button--active' : ''}`}
          onClick={() => onModeChange('register')}
        >
          Register
        </button>
      </div>

      <form className="form" onSubmit={handleSubmit} noValidate>
        {mode === 'register' ? (
          <label className="form-field">
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            {fieldErrors.name ? <small className="field-error">{fieldErrors.name}</small> : null}
          </label>
        ) : null}

        <label className="form-field">
          <span>Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" />
          {fieldErrors.email ? <small className="field-error">{fieldErrors.email}</small> : null}
        </label>

        <label className="form-field">
          <span>Password</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          {fieldErrors.password ? <small className="field-error">{fieldErrors.password}</small> : null}
        </label>

        {error ? <div className="api-error">{error.message}</div> : null}

        <button className="button button--primary" type="submit" disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
        </button>
      </form>
    </section>
  );
}

export default AuthPanel;
