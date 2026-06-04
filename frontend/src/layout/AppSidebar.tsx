import { useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";

// ── Icons ────────────────────────────────────────────────────
const GridIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>);
const UsersIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const UserIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const PackageIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>);
const GownIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>);
const ReturnIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>);
const HistoryIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const LogoutIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);

const AppSidebar: React.FC = () => {
  const { t } = useTranslation();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const isActive  = useCallback((path: string) => location.pathname === path, [location.pathname]);
  const showLabel = isExpanded || isHovered || isMobileOpen;

  const navItems = [
    { path: "/dashboard", icon: <GridIcon />,    label: t("nav.dashboard") },
    { path: "/students",  icon: <UsersIcon />,   label: t("nav.students")  },
    { path: "/staff",     icon: <UserIcon />,    label: t("nav.staff")     },
    { path: "/items",     icon: <PackageIcon />, label: t("nav.items")     },
    { path: "/borrowing", icon: <GownIcon />,    label: t("nav.borrowing") },
    { path: "/returns",   icon: <ReturnIcon />,  label: t("nav.returns")   },
    { path: "/history",   icon: <HistoryIcon />, label: t("nav.history")   },
  ];

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className={`py-6 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link to="/dashboard" className="flex items-center gap-3">
          <img
            src="/images/logo/logo.png"
            alt="Setec"
            width={40}
            height={40}
            className="shrink-0"
          />
          {showLabel && (
            <div className="leading-tight">
              <p className="text-base font-bold text-gray-900 dark:text-white">SETEC</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Institute</p>
            </div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1">
        <nav className="flex-1">
          {showLabel && (
            <p className="mb-3 text-xs uppercase tracking-widest text-gray-400 px-1">
              Menu
            </p>
          )}
          <ul className="flex flex-col gap-1">
            {navItems.map(({ path, icon, label }) => (
              <li key={path}>
                <Link
                  to={path}
                  className={`menu-item group ${isActive(path) ? "menu-item-active" : "menu-item-inactive"} ${!showLabel ? "lg:justify-center" : ""}`}
                >
                  <span className={`menu-item-icon-size ${isActive(path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                    {icon}
                  </span>
                  {showLabel && <span className="menu-item-text">{label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info + Logout */}
        {showLabel && user && (
          <div className="pb-6 mt-auto border-t border-gray-200 dark:border-gray-800 pt-4">
            <div className="mb-3 px-1">
              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                {user.display_name || user.name_en || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="menu-item group menu-item-inactive w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <span className="menu-item-icon-size text-red-500"><LogoutIcon /></span>
              <span className="menu-item-text">{t("actions.logout")}</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;
