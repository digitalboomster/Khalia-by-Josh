import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Wallet,
  User,
  TrendingUp,
  Store,
  Menu,
  X,
  Sparkles,
  Bell,
  Flame,
  ChevronRight,
  LogOut,
  Settings,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "./ui/utils";
import { useAuth } from "../context/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Groups", href: "/groups", icon: Users },
  { name: "Marketplace", href: "/marketplace", icon: Store },
  { name: "ShūrāBot", href: "/shurabot", icon: Sparkles, badge: "AI" },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Profile", href: "/profile", icon: User },
];

export function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  if (!user) {
    return <Outlet />;
  }

  const userInitial = user.first_name?.[0] || user.email?.[0] || 'U';
  const userName = user.first_name && user.last_name 
    ? `${user.first_name} ${user.last_name}` 
    : user.email;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">Khalia</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-1.5 rounded-lg hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadInsights > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                {unreadInsights}
              </span>
            )}
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white pt-16 overflow-y-auto pb-20">
          {/* User Card */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-semibold">
                {userInitial}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{userName}</div>
                <div className="text-xs text-gray-500">KYC Level {user.kyc_level}</div>
              </div>
            </div>
          </div>
          <nav className="px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== "/" && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                    isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-0 h-4">{item.badge}</Badge>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="px-4 py-4 border-t border-gray-100 mt-auto">
            <Button 
              onClick={handleLogout}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
              variant="outline"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Khalia</div>
              <div className="text-xs text-gray-500">Community Finance</div>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 border-b border-gray-100">
          <Link to="/profile" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-semibold flex-shrink-0">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900 truncate">{userName}</div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Shield className="w-3 h-3" />
                <span>KYC Level {user.kyc_level}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== "/" && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className={cn("w-4.5 h-4.5 flex-shrink-0", isActive ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-600")} />
                <span className="flex-1 text-sm">{item.name}</span>
                {item.badge && (
                  <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-0 h-4 px-1.5">{item.badge}</Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer with Logout */}
        <div className="px-4 py-3 border-t border-gray-100 space-y-2">
          <Button 
            onClick={handleLogout}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 justify-start"
            variant="outline"
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
          <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
            © 2026 Khalia
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
