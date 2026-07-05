import { FinanceStudioWordmark, StudioIcon, type UserProfile } from '../pages/shared';
import './TopNav.css';

export function TopNav({ user, onToggleSidebar }: { user: UserProfile, onToggleSidebar: () => void }) {
  return (
    <header className="app-topbar">
      <FinanceStudioWordmark />
      <div className="spacer" />
      <div className="session-chip">
        <span className="hide-mobile">Logged in as {user.login}</span>
        <button type="button" className="mobile-menu-btn" onClick={onToggleSidebar} aria-label="Toggle menu">
          <StudioIcon name="menu" />
        </button>
        <i aria-hidden="true" />
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" />
        ) : (
          <span className="avatar-fallback">
            <StudioIcon name="person" filled />
          </span>
        )}
      </div>
    </header>
  );
}
