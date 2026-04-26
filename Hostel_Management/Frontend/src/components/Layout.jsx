import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BedDouble,
  Users,
  Wallet,
  MessageSquareWarning,
  BellRing,
  LogOut,
  Menu,
  HomeIcon,
  Hotel,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/home', label: 'Home', icon: HomeIcon },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/rooms', label: 'Rooms', icon: BedDouble },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/fees', label: 'Fees', icon: Wallet },
  { to: '/complaints', label: 'Complaints', icon: MessageSquareWarning },
  { to: '/staff-notices', label: 'Staff & Notices', icon: BellRing },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
              ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:scale-[1.02]'
              }`
            }
          >
            <Icon
              size={18}
              className="transition-transform duration-300 group-hover:scale-110"
            />

            {sidebarOpen && (
              <span className="whitespace-nowrap">{label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* USER SECTION */}
      <div className="px-3 py-4 border-t border-slate-800">

        <div className="flex items-center gap-3 px-3 py-2 mb-3 rounded-xl hover:bg-slate-800 transition">
          <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow">
            <span className="text-sm font-semibold text-white">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>

          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.username}
              </p>
              <p className="text-xs text-slate-400 capitalize">
                {user?.role}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} />
          {sidebarOpen && "Logout"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a] text-white overflow-hidden">

      {/* 🔥 PREMIUM HEADER */}
      <header className="relative h-16 flex items-center justify-between px-4 md:px-6 
      bg-gradient-to-r from-[#0f172a] via-[#020617] to-[#0f172a] 
      border-b border-slate-800 backdrop-blur-lg shadow-sm">

        {/* MENU */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
        >
          <Menu size={20} />
        </button>

        {/* LOGO */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3 group cursor-pointer">

          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition">
            <Hotel size={20} className="text-white" />
          </div>

          <div className="text-center leading-tight">
            <p className="text-lg font-bold tracking-wide group-hover:text-blue-400 transition">
              HostelOS
            </p>
            <p className="text-xs text-slate-400">
              Management System
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">

          <div className="relative p-2 rounded-lg hover:bg-slate-800 cursor-pointer">
            <BellRing size={18} className="text-slate-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>

          <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-800 cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-white">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>

            <span className="hidden md:block text-sm text-slate-300">
              {user?.username}
            </span>
          </div>

        </div>

      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <aside
          className={`hidden md:flex flex-col bg-[#020617] border-r border-slate-800 transition-all duration-300 ${
            sidebarOpen ? 'w-60' : 'w-20'
          }`}
        >
          <SidebarContent />
        </aside>

        {/* MOBILE */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />

            <aside className="absolute left-0 top-0 h-full w-60 bg-[#020617] shadow-2xl z-50 flex flex-col">
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};

export default Layout;