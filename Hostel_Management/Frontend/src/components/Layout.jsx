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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-blue-700">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">
              {user?.username}
            </p>
            <p className="text-xs text-slate-400 capitalize">
              {user?.role}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">

      {/* Full Top Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-100 shrink-0">

        {/* Left */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>

          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Hotel size={20} className="text-white" />
          </div>

          <div>
            <p className="text-lg font-bold text-slate-800">HostelOS</p>
            <p className="text-xs text-slate-400">Management System</p>
          </div>
        </div>

        {/* Right */}
        <div className="text-sm text-slate-500">
          Welcome, {user?.username}
        </div>

      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-60 bg-white border-r border-slate-100 shrink-0">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">

            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />

            <aside className="absolute left-0 top-16 h-[calc(100%-4rem)] w-60 bg-white shadow-2xl z-50 flex flex-col">
              <SidebarContent />
            </aside>

          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto fade-in">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};

export default Layout;