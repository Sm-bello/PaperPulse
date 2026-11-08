import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Bookmark, 
  LogIn, 
  LogOut, 
  Wifi, 
  WifiOff,
  Smartphone,
  Layers,
  Menu,
  X
} from 'lucide-react';
import type { UserProfile } from '../types';
import { logOut } from '../services/firebase';

interface NavbarProps {
  user: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenGoogleSignIn: () => void;
  onOpenArcAI: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenGoogleSignIn,
  onOpenArcAI,
  onToggleSidebar,
  isSidebarOpen,
  savedCount,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="h-14 border-b border-schola-border bg-schola-panel px-3 sm:px-6 flex items-center justify-between select-none sticky top-0 z-40 backdrop-blur-md">
      
      {/* Left: Sidebar Toggle & Brand Logo (No generic colored dots!) */}
      <div className="flex items-center space-x-2.5 sm:space-x-4">
        
        {/* Mobile/Desktop Sidebar Toggle Button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-schola-muted hover:text-schola-text hover:bg-schola-subtle transition cursor-pointer"
            title="Toggle Collections Sidebar"
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        )}

        {/* Brand Logo (THE SCHOLA) */}
        <div 
          onClick={() => setActiveTab('Library')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-md bg-white border border-schola-border shadow-2xs flex items-center justify-center overflow-hidden p-0.5">
            <img src="/logo.png" alt="THE SCHOLA" className="w-full h-full object-contain" />
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="font-serif tracking-widest text-sm sm:text-base font-bold text-schola-text uppercase">
              THE SCHOLA
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-schola-subtle text-schola-muted border border-schola-border hidden sm:inline">
              ScholaPulse
            </span>
          </div>
        </div>

      </div>

      {/* Center Nav: ONLY Purposeful & Active Functional Tabs */}
      <nav className="flex items-center space-x-1 sm:space-x-2 text-xs">
        
        {/* Literature Discovery / Harvest */}
        <button
          onClick={() => setActiveTab('Library')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer font-sans ${
            activeTab === 'Library' 
              ? 'bg-schola-subtle text-schola-text font-semibold shadow-2xs border border-schola-border' 
              : 'text-schola-muted hover:text-schola-text hover:bg-schola-subtle/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Discovery & Harvest</span>
          <span className="sm:hidden">Harvest</span>
        </button>

        {/* Saved Shelf */}
        <button
          onClick={() => setActiveTab('Shelf')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer font-sans ${
            activeTab === 'Shelf' 
              ? 'bg-schola-subtle text-schola-text font-semibold shadow-2xs border border-schola-border' 
              : 'text-schola-muted hover:text-schola-text hover:bg-schola-subtle/50'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">My Shelf</span>
          <span className="sm:hidden">Shelf</span>
          {savedCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-schola-border text-schola-text">
              {savedCount}
            </span>
          )}
        </button>

      </nav>

      {/* Right: ARC AI Button & Google Sign-In */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        
        {/* Network status icon */}
        <span 
          title={isOnline ? "Online: Gemini 2.5 Flash active" : "Offline: Edge NLP active"}
          className="p-1 text-schola-muted hidden sm:inline"
        >
          {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-700" /> : <WifiOff className="w-3.5 h-3.5 text-amber-700" />}
        </span>

        {/* ARC Assistant Pill Button */}
        <button
          onClick={onOpenArcAI}
          className="flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-schola-arc hover:bg-schola-arcHover text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
          title="ARC Intelligent Research Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
          <span>ARC AI</span>
        </button>

        {/* User Avatar Circle / Google Sign-In */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 rounded-full bg-schola-subtle border border-schola-border flex items-center justify-center font-bold text-schola-text text-xs hover:border-schola-arc transition overflow-hidden cursor-pointer"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
              ) : (
                <span>{(user.displayName || user.email || 'P')[0].toUpperCase()}</span>
              )}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-schola-border shadow-2xl py-2 text-xs z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3.5 py-2.5 border-b border-schola-border bg-schola-panel/50">
                  <p className="font-semibold text-schola-text truncate">{user.displayName || "Researcher"}</p>
                  <p className="text-[11px] text-schola-muted font-mono truncate">{user.email}</p>
                </div>
                <div className="px-3.5 py-2 text-[11px] text-schola-muted">
                  <p className="flex items-center space-x-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-schola-arc" />
                    <span>Android APK v2.0 Ready</span>
                  </p>
                </div>
                <div className="border-t border-schola-border pt-1">
                  <button
                    onClick={() => {
                      logOut();
                      setShowUserMenu(false);
                      window.location.reload();
                    }}
                    className="w-full flex items-center space-x-2 px-3.5 py-2 text-rose-700 hover:bg-rose-50 text-left cursor-pointer transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenGoogleSignIn}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-schola-border bg-white hover:bg-schola-subtle text-xs font-medium text-schola-text transition cursor-pointer shadow-2xs"
          >
            <LogIn className="w-3.5 h-3.5 text-schola-arc" />
            <span className="hidden sm:inline">Sign In with Gmail</span>
            <span className="sm:hidden">Sign In</span>
          </button>
        )}

      </div>
    </header>
  );
};
