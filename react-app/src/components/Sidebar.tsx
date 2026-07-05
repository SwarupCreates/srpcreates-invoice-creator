import { NavLink } from 'react-router-dom';
import { FinanceStudioWordmark, StudioIcon, navItems } from '../pages/shared';
import './Sidebar.css';

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <aside className="side-rail">
      <nav className="rail-nav" aria-label="Workspace">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => `rail-link${isActive ? ' active' : ''}`}
          >
            <StudioIcon name={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="rail-footer">
        <div className="release-card">
          <FinanceStudioWordmark mark="/src/assets/icons/FinanceStudioWhiteLogoMark.svg" muted />
          <span>release-v1.0</span>
        </div>

        <button type="button" className="rail-link utility">
          <StudioIcon name="account_circle" />
          Account Manager
        </button>

        <button type="button" className="rail-link sign-out" onClick={onLogout}>
          <StudioIcon name="logout" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
