import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  ArrowRightLeft,
  LogOut,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Desktop navigation styles
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-gradient-to-tr from-fuchsia-600 to-orange-500 text-white shadow-sm'
        : 'text-slate-200 hover:bg-gradient-to-tr from-fuchsia-500 to-orange-400 hover:text-white'
    }`;

  // Mobile navigation styles
  const mobileLinkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-1 
    min-w-0 w-full py-2 px-1 rounded-md text-[10px] font-medium 
    transition-colors whitespace-nowrap ${
      isActive
        ? 'bg-gradient-to-tr from-fuchsia-600 to-orange-500 text-white shadow-sm'
        : 'text-slate-200 hover:bg-slate-800'
    }`;

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md w-full">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-10 h-10 flex-shrink-0 shadow-xl shadow-blue-500/25 ring-4 ring-blue-500/20 rounded-lg overflow-hidden">
              <img
                src="https://lscdn.azureedge.net/biz-live/img/photos-11122501-16318942603657166.jpeg"
                alt="Techmindz Logo"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold text-white leading-none">
                  Techmindz
                </span>

                <span className="text-[10px] sm:text-xs text-slate-300 tracking-tight mt-1">
                  Embrace the future
                </span>
              </div>

              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold bg-orange-900/60 text-orange-300 rounded border border-orange-700/50 whitespace-nowrap">
                Cell Portal
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/dashboard" className={navLinkClass}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/students" className={navLinkClass}>
              <Users className="w-4 h-4" />
              <span>Students</span>
            </NavLink>

            <NavLink to="/batches" className={navLinkClass}>
              <FolderGit2 className="w-4 h-4" />
              <span>Batches</span>
            </NavLink>

            <NavLink to="/batch-switch" className={navLinkClass}>
              <ArrowRightLeft className="w-4 h-4" />
              <span>Batch switch</span>
            </NavLink>
          </nav>

          {/* User Details and Logout */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {user && (
              <div className="hidden sm:flex items-center gap-2.5 bg-slate-700/60 border border-slate-700/80 px-3 py-1.5 rounded-full">
                <div className="w-7 h-7 rounded-full bg-amber-600/30 text-lime-400 border border-blue-500/40 flex items-center justify-center text-xs font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div className="text-left text-xs">
                  <p className="font-semibold text-lime-200 leading-tight">
                    {user.name}
                  </p>

                  <p className="text-lime-400 text-[10px] truncate max-w-[120px]">
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 hover:text-rose-100 transition shadow-sm whitespace-nowrap"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-t border-slate-800 px-2 py-1 bg-slate-900/95">
        <div className="grid grid-cols-4 gap-1">
          <NavLink to="/dashboard" className={mobileLinkClass}>
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/students" className={mobileLinkClass}>
            <Users className="w-4 h-4" />
            <span>Students</span>
          </NavLink>

          <NavLink to="/batches" className={mobileLinkClass}>
            <FolderGit2 className="w-4 h-4" />
            <span>Batches</span>
          </NavLink>

          <NavLink to="/batch-switch" className={mobileLinkClass}>
            <ArrowRightLeft className="w-4 h-4" />
            <span>Switch</span>
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
