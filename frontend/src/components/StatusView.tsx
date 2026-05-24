import { ReactNode } from 'react';

type StatusViewProps = {
  title: string;
  message: string;
  variant?: 'info' | 'error' | 'empty' | 'loading';
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
};

export function StatusView({
  title,
  message,
  variant = 'info',
  actionLabel,
  onAction,
  children
}: StatusViewProps) {
  return (
    <section className={`status-view status-view--${variant}`} aria-live="polite">
      <h2>{title}</h2>
      <p>{message}</p>
      {actionLabel && onAction ? (
        <button type="button" className="button button--secondary" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
      {children}
    </section>
  );
}

export default StatusView;
