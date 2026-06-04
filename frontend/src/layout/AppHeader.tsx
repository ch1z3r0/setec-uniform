import { useState } from "react";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import LanguageToggle from "../components/common/LanguageToggle";
import { useTranslation } from "react-i18next";

const AppHeader: React.FC = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { user } = useAuth();
  const { i18n } = useTranslation();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) toggleSidebar();
    else toggleMobileSidebar();
  };

  const displayName = user?.display_name || user?.name_en || "User";
  const nameKh = user?.name_kh;

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex items-center justify-between grow lg:px-6 px-3 py-3 lg:py-4">

        {/* Left — sidebar toggle */}
        <button
          className="flex items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg dark:border-gray-800 dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
          onClick={handleToggle}
          aria-label="Toggle Sidebar"
        >
          {isMobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="0" y1="1" x2="18" y2="1"/><line x1="0" y1="7" x2="12" y2="7"/><line x1="0" y1="13" x2="18" y2="13"/>
            </svg>
          )}
        </button>

        {/* Right — language, theme, user */}
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggleButton />

          {/* User pill */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5">
              <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="leading-tight">
                <p className="text-xs font-medium text-gray-800 dark:text-white">
                  {i18n.language === "km" && nameKh ? nameKh : displayName}
                </p>
                <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
