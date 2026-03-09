import { Outlet, Link, useLocation } from "react-router";
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
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "./ui/utils";
import { currentUser, proactiveInsights } from "../data/mockData";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Capital Intelligence", href: "/capital-intelligence", icon: TrendingUp },
  { name: "Groups", href: "/groups", icon: Users },
  { name: "Marketplace", href: "/marketplace", icon: Store },
  { name: "ShūrāBot", href: "/shurabot", icon: Sparkles, badge: "AI" },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Profile", href: "/profile", icon: User },
];

export function RootLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadInsights = proactiveInsights.length;

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
        <div className="lg:hidden fixed inset-0 z-40 bg-white pt-16 overflow-y-auto">
          {/* User Card */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-semibold">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{currentUser.name}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-orange-500" />
                  {currentUser.contributionStreak}-month streak
                </div>
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
                  {item.href === "/shurabot" && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
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
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900 truncate">{currentUser.name}</div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Flame className="w-3 h-3 text-orange-500" />
                <span className="text-orange-600">{currentUser.contributionStreak}mo streak</span>
                <span>·</span>
                <span>{currentUser.wellnessScore}% health</span>
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
                {item.href === "/shurabot" && !isActive && (
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ShūrāBot Insight Banner */}
        {unreadInsights > 0 && (
          <div className="px-3 py-3 border-t border-gray-100">
            <Link to="/shurabot">
              <div className="flex items-start gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer">
                <Bell className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-emerald-800">
                    {unreadInsights} new insight{unreadInsights > 1 ? "s" : ""} from ShūrāBot
                  </div>
                  <p className="text-[10px] text-emerald-700 truncate mt-0.5">
                    {proactiveInsights[0]?.title}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <div className="text-xs text-gray-400">Shariah-Compliant Platform</div>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">© 2026 Khalia · All rights reserved</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
