import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import {
  BoxCubeIcon, CalenderIcon, ChevronDownIcon, GridIcon,
  HorizontaLDots, ListIcon, PageIcon, PieChartIcon,
  PlugInIcon, TableIcon, UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const GownIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>);
const UsersIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const PackageIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>);
const ArrowReturnIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>);
const ClockIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const LogoutIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);

const AppSidebar: React.FC = () => {
  const { t } = useTranslation();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const isSetec   = location.pathname.startsWith("/setec");

  const setecNav: NavItem[] = [
    { icon: <GridIcon />,         name: t("nav.dashboard"), path: "/setec" },
    { icon: <UsersIcon />,        name: t("nav.students"),  path: "/setec/students" },
    { icon: <UserCircleIcon />,   name: t("nav.staff"),     path: "/setec/staff" },
    { icon: <PackageIcon />,      name: t("nav.items"),     path: "/setec/items" },
    { icon: <GownIcon />,         name: t("nav.borrowing"), path: "/setec/borrowing" },
    { icon: <ArrowReturnIcon />,  name: t("nav.returns"),   path: "/setec/returns" },
    { icon: <ClockIcon />,        name: t("nav.history"),   path: "/setec/history" },
  ];

  const navItems: NavItem[] = [
    { icon: <GridIcon />, name: "Dashboard", subItems: [{ name: "Ecommerce", path: "/" }] },
    { icon: <CalenderIcon />, name: "Calendar", path: "/calendar" },
    { icon: <UserCircleIcon />, name: "User Profile", path: "/profile" },
    { name: "Forms", icon: <ListIcon />, subItems: [{ name: "Form Elements", path: "/form-elements" }] },
    { name: "Tables", icon: <TableIcon />, subItems: [{ name: "Basic Tables", path: "/basic-tables" }] },
    { name: "Pages", icon: <PageIcon />, subItems: [{ name: "Blank Page", path: "/blank" }, { name: "404 Error", path: "/error-404" }] },
  ];
  const othersItems: NavItem[] = [
    { icon: <PieChartIcon />, name: "Charts", subItems: [{ name: "Line Chart", path: "/line-chart" }, { name: "Bar Chart", path: "/bar-chart" }] },
    { icon: <BoxCubeIcon />, name: "UI Elements", subItems: [{ name: "Alerts", path: "/alerts" }, { name: "Avatar", path: "/avatars" }, { name: "Badge", path: "/badge" }, { name: "Buttons", path: "/buttons" }, { name: "Images", path: "/images" }, { name: "Videos", path: "/videos" }] },
    { icon: <PlugInIcon />, name: "Authentication", subItems: [{ name: "Sign In", path: "/signin" }, { name: "Sign Up", path: "/signup" }] },
  ];

  const [openSubmenu, setOpenSubmenu] = useState<{ type:"main"|"others"; index:number } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  useEffect(() => {
    let matched = false;
    (["main","others"] as const).forEach(mt => {
      const items = mt === "main" ? navItems : othersItems;
      items.forEach((nav, idx) => {
        if (nav.subItems?.some(s => isActive(s.path))) { setOpenSubmenu({ type:mt, index:idx }); matched=true; }
      });
    });
    if (!matched) setOpenSubmenu(null);
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key])
        setSubMenuHeight(p => ({ ...p, [key]: subMenuRefs.current[key]?.scrollHeight||0 }));
    }
  }, [openSubmenu]);

  const toggleSubmenu = (idx:number, mt:"main"|"others") =>
    setOpenSubmenu(p => (p?.type===mt && p?.index===idx) ? null : { type:mt, index:idx });

  const renderItems = (items: NavItem[], mt:"main"|"others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, idx) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button onClick={()=>toggleSubmenu(idx,mt)}
              className={`menu-item group ${openSubmenu?.type===mt&&openSubmenu?.index===idx?"menu-item-active":"menu-item-inactive"} cursor-pointer ${!isExpanded&&!isHovered?"lg:justify-center":"lg:justify-start"}`}>
              <span className={`menu-item-icon-size ${openSubmenu?.type===mt&&openSubmenu?.index===idx?"menu-item-icon-active":"menu-item-icon-inactive"}`}>{nav.icon}</span>
              {(isExpanded||isHovered||isMobileOpen)&&<span className="menu-item-text">{nav.name}</span>}
              {(isExpanded||isHovered||isMobileOpen)&&<ChevronDownIcon className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type===mt&&openSubmenu?.index===idx?"rotate-180 text-brand-500":""}`}/>}
            </button>
          ) : nav.path && (
            <Link to={nav.path} className={`menu-item group ${isActive(nav.path)?"menu-item-active":"menu-item-inactive"}`}>
              <span className={`menu-item-icon-size ${isActive(nav.path)?"menu-item-icon-active":"menu-item-icon-inactive"}`}>{nav.icon}</span>
              {(isExpanded||isHovered||isMobileOpen)&&<span className="menu-item-text">{nav.name}</span>}
            </Link>
          )}
          {nav.subItems&&(isExpanded||isHovered||isMobileOpen)&&(
            <div ref={el=>{subMenuRefs.current[`${mt}-${idx}`]=el;}} className="overflow-hidden transition-all duration-300"
              style={{height:openSubmenu?.type===mt&&openSubmenu?.index===idx?`${subMenuHeight[`${mt}-${idx}`]}px`:"0px"}}>
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map(sub=>(
                  <li key={sub.name}>
                    <Link to={sub.path} className={`menu-dropdown-item ${isActive(sub.path)?"menu-dropdown-item-active":"menu-dropdown-item-inactive"}`}>
                      {sub.name}
                      {(sub.new||sub.pro)&&<span className={`ml-auto ${isActive(sub.path)?"menu-dropdown-badge-active":"menu-dropdown-badge-inactive"} menu-dropdown-badge`}>{sub.new?"new":"pro"}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded||isMobileOpen?"w-[290px]":isHovered?"w-[290px]":"w-[90px]"}
        ${isMobileOpen?"translate-x-0":"-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={()=>!isExpanded&&setIsHovered(true)} onMouseLeave={()=>setIsHovered(false)}>
      <div className={`py-8 flex ${!isExpanded&&!isHovered?"lg:justify-center":"justify-start"}`}>
        <Link to={isSetec?"/setec":"/"}>
          {isExpanded||isHovered||isMobileOpen ? (
            <><img className="dark:hidden" src="/images/logo/logo.svg" alt="Logo" width={150} height={40}/><img className="hidden dark:block" src="/images/logo/logo-dark.svg" alt="Logo" width={150} height={40}/></>
          ) : <img src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32}/>}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          {isSetec ? (
            <div>
              {(isExpanded||isHovered||isMobileOpen)&&<h2 className="mb-4 text-xs uppercase leading-[20px] text-gray-400">Setec</h2>}
              <ul className="flex flex-col gap-2">
                {setecNav.map(nav=>nav.path&&(
                  <li key={nav.path}>
                    <Link to={nav.path} className={`menu-item group ${isActive(nav.path)?"menu-item-active":"menu-item-inactive"} ${!isExpanded&&!isHovered?"lg:justify-center":""}`}>
                      <span className={`menu-item-icon-size ${isActive(nav.path)?"menu-item-icon-active":"menu-item-icon-inactive"}`}>{nav.icon}</span>
                      {(isExpanded||isHovered||isMobileOpen)&&<span className="menu-item-text">{nav.name}</span>}
                    </Link>
                  </li>
                ))}
                {(isExpanded||isHovered||isMobileOpen)&&user&&(
                  <li className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <button onClick={()=>{logout();navigate("/setec/login");}} className="menu-item group menu-item-inactive w-full text-red-500 hover:text-red-600">
                      <span className="menu-item-icon-size"><LogoutIcon/></span>
                      <span className="menu-item-text">{t("actions.logout")}</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded&&!isHovered?"lg:justify-center":"justify-start"}`}>
                  {isExpanded||isHovered||isMobileOpen?"Menu":<HorizontaLDots className="size-6"/>}
                </h2>
                {renderItems(navItems,"main")}
              </div>
              <div>
                <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded&&!isHovered?"lg:justify-center":"justify-start"}`}>
                  {isExpanded||isHovered||isMobileOpen?"Others":<HorizontaLDots/>}
                </h2>
                {renderItems(othersItems,"others")}
              </div>
            </div>
          )}
        </nav>
        {(isExpanded||isHovered||isMobileOpen)&&!isSetec?<SidebarWidget/>:null}
      </div>
    </aside>
  );
};

export default AppSidebar;
