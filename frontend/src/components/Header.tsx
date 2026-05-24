import { PublicUser, RouteState } from '../types';

type HeaderProps = {
  user: PublicUser | null;
  currentRoute: RouteState;
  onNavigate: (route: RouteState) => void;
  onLogout: () => void;
  logoutLoading: boolean;
};

const navButtonClass = (active: boolean) => `nav-link${active ? ' nav-link--active' : ''}`;

export function Header({ user, currentRoute, onNavigate, onLogout, logoutLoading }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="brand" role="button" tabIndex={0} onClick={() => onNavigate({ name: user ? 'dashboard' : 'home' })} onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onNavigate({ name: user ? 'dashboard' : 'home' });
        }
      }}>
        <span className="brand__badge">PB</span>
        <div>
          <strong>PhishBlocker</strong>
          <div className="brand__tag">Phishing awareness simulator</div>
        </div>
      </div>

      <nav className="nav" aria-label="Primary navigation">
        {user ? (
          <>
            <button className={navButtonClass(currentRoute.name === 'dashboard')} onClick={() => onNavigate({ name: 'dashboard' })}>Dashboard</button>
            <button className={navButtonClass(currentRoute.name === 'scenarios' || currentRoute.name === 'scenario')} onClick={() => onNavigate({ name: 'scenarios' })}>Scenarios</button>
            <button className={navButtonClass(currentRoute.name === 'resources')} onClick={() => onNavigate({ name: 'resources' })}>Resources</button>
            <button className={navButtonClass(currentRoute.name === 'profile')} onClick={() => onNavigate({ name: 'profile' })}>Profile</button>
          </>
        ) : (
          <>
            <button className={navButtonClass(currentRoute.name === 'home')} onClick={() => onNavigate({ name: 'home' })}>Home</button>
            <button className={navButtonClass(false)} onClick={() => onNavigate({ name: 'home' })}>Sign in</button>
          </>
        )}
      </nav>

      <div className="header-actions">
        {user ? (
          <>
            <div className="user-chip">
              <span>{user.name}</span>
              <small>{user.email}</small>
            </div>
            <button className="button button--ghost" onClick={onLogout} disabled={logoutLoading}>
              {logoutLoading ? 'Signing out...' : 'Logout'}
            </button>
          </>
        ) : (
          <div className="safety-note">Safe fictional training scenarios only</div>
        )}
      </div>
    </header>
  );
}

export default Header;
