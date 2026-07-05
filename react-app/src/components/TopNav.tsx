import { FinanceStudioWordmark, StudioIcon, type UserProfile } from '../pages/shared';
import './TopNav.css';

export function TopNav({ user }: { user: UserProfile }) {
  return (
    <header className="app-topbar">
      <FinanceStudioWordmark />
      <div className="session-chip">
        <span>Logged in as {user.login}</span>
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
