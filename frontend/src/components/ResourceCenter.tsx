import { EducationalResource } from '../types';
import StatusView from './StatusView';

type ResourceCenterProps = {
  loading: boolean;
  error: string | null;
  resources: EducationalResource[];
  onRetry: () => void;
};

export function ResourceCenter({ loading, error, resources, onRetry }: ResourceCenterProps) {
  if (loading) {
    return <StatusView title="Loading resources" message="Fetching phishing awareness guidance from the backend." variant="loading" />;
  }

  if (error) {
    return <StatusView title="Unable to load resources" message={error} variant="error" actionLabel="Retry" onAction={onRetry} />;
  }

  if (resources.length === 0) {
    return <StatusView title="No resources available" message="The educational resource library is currently empty." variant="empty" actionLabel="Retry" onAction={onRetry} />;
  }

  return (
    <section className="resource-grid">
      {resources.map((resource) => (
        <article key={resource.id} className="panel resource-card">
          <div className="panel__header">
            <h2>{resource.title}</h2>
            <p>{resource.category} · {resource.estimatedReadMinutes} min read</p>
          </div>
          <p>{resource.summary}</p>
          <div className="resource-content">{resource.content}</div>
        </article>
      ))}
    </section>
  );
}

export default ResourceCenter;
