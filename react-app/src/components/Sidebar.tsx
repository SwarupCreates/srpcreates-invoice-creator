import { NavLink } from 'react-router-dom';
import { FinanceStudioWordmark, StudioIcon, navItems, financeLogoWhite } from '../pages/shared';
import './Sidebar.css';

export function Sidebar({ isOpen, onClose, onLogout }: { isOpen?: boolean, onClose?: () => void, onLogout: () => void }) {
  return (
    <aside className={`side-rail ${isOpen ? 'open' : ''}`}>
      <div className="side-rail-inner">
        <nav className="rail-nav" aria-label="Workspace">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => `rail-link${isActive ? ' active' : ''}`}
            onClick={() => onClose && onClose()}
          >
            <StudioIcon name={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="rail-footer">
        <div className="release-card">
          <FinanceStudioWordmark mark={financeLogoWhite} muted />
          <span>release-v1.0</span>
        </div>

        <NavLink 
          to="/account" 
          className={({ isActive }) => `rail-link utility${isActive ? ' active' : ''}`} 
          onClick={() => onClose && onClose()}
        >
          <StudioIcon name="account_circle" />
          Account Manager
        </NavLink>

        <button type="button" className="rail-link sign-out" onClick={onLogout}>
          <StudioIcon name="logout" />
          Sign Out
        </button>
      </div>
      </div>
    </aside>
  );
}
