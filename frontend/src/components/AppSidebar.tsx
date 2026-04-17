import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, BarChart3, Grid3X3, Compass, Heart, Menu, X, Play, TrendingUp, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { to: "/categories", icon: Grid3X3, label: "Categories" },
  { to: "/creators", icon: Compass, label: "Creators" },
  { to: "/favorites", icon: Heart, label: "Favorites" },
  { to: "/video-analyzer", icon: Play, label: "Video Analyzer" },
];

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-[#FF0000] text-white shadow-lg"
                  : "text-[#A0A0A0] hover:bg-[#121212] hover:text-[#FFFFFF]"
              }`}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info and Logout */}
      <div className="border-t border-gray-700 p-3 space-y-3">
        {user && !collapsed && (
          <div className="px-3 py-2 bg-[#121212] rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Logged in as</p>
            <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
          </div>
        )}
        <Button
          onClick={handleLogout}
          className="w-full bg-destructive hover:bg-destructive/90 text-white gap-2"
          size="sm"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-lg bg-[#121212] border border-gray-700 text-[#FFFFFF] lg:hidden"
      >
        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/80 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen border-r border-gray-700 bg-[#030303] flex flex-col transition-all duration-150 ${
          collapsed ? "w-16" : "w-56"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-gray-700 px-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#FF0000] rounded-lg flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-[#FFFFFF]">
                TrendTube
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-sm text-[#A0A0A0] hover:text-[#FFFFFF] hover:bg-[#1A1A1A] transition-colors"
          >
            <Menu className="h-3.5 w-3.5" />
          </button>
        </div>

        {sidebarContent}
      </aside>
    </>
  );
};

export default AppSidebar;
