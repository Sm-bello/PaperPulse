import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Bookmark, 
  LogIn, 
  LogOut, 
  Wifi, 
  WifiOff,
  Layers, 
  BookOpen, 
  HardDrive, 
  Menu, 
  X,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import type { UserProfile } from '../types';
import { logOut } from '../services/firebase';

interface NavbarProps {
  user: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenGoogleSignIn: () => void;
  onOpenArcAI: () => void;
  onOpenTour?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  savedCount: number;
  downloadedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenGoogleSignIn,
  onOpenArcAI,
  onOpenTour,
  onToggleSidebar,
  isSidebarOpen,
  savedCount,
  downloadedCount,
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
    <>
      {/* Top Navbar */}
      <header className="h-14 border-b border-schola-border bg-schola-panel px-3 sm:px-6 flex items-center justify-between select-none sticky top-0 z-40 backdrop-blur-md">
        
        {/* Left: Sidebar Toggle & Brand Logo */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          
          {/* Sidebar Toggle Button */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-schola-muted hover:text-schola-text hover:bg-schola-subtle transition cursor-pointer"
              title="Toggle Research Collections Sidebar"
              aria-label="Toggle Sidebar"
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}

          {/* Forever Brand Logo (THE SCHOLA) */}
          <div 
            onClick={() => setActiveTab('Library')}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-md bg-white border border-schola-border shadow-2xs flex items-center justify-center overflow-hidden p-0.5 shrink-0">
              <img src="/logo.png" alt="THE SCHOLA Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-serif tracking-widest text-xs sm:text-sm md:text-base font-bold text-schola-text uppercase truncate">
                THE SCHOLA
              </span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-schola-subtle text-schola-muted border border-schola-border hidden lg:inline">
                ScholaPulse
              </span>
            </div>
          </div>

        </div>

        {/* Center: Desktop Navigation Tabs (Hidden on mobile to prevent clipping) */}
        <nav className="hidden md:flex items-center space-x-1 text-xs">
          
          {/* Library Reader */}
          <button
            onClick={() => setActiveTab('Library')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer font-sans ${
              activeTab === 'Library' 
                ? 'bg-[#ede5d8] text-schola-text font-bold shadow-2xs border border-[#ddcca8]' 
                : 'text-schola-muted hover:text-schola-text hover:bg-schola-subtle/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-schola-arc" />
            <span>Library</span>
          </button>

          {/* Harvest */}
          <button
            onClick={() => setActiveTab('Harvest')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer font-sans ${
              activeTab === 'Harvest' 
                ? 'bg-[#ede5d8] text-schola-text font-bold shadow-2xs border border-[#ddcca8]' 
                : 'text-schola-muted hover:text-schola-text hover:bg-schola-subtle/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Harvest</span>
          </button>

          {/* Saved Shelf */}
          <button
            onClick={() => setActiveTab('Shelf')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer font-sans ${
              activeTab === 'Shelf' 
                ? 'bg-[#ede5d8] text-schola-text font-bold shadow-2xs border border-[#ddcca8]' 
                : 'text-schola-muted hover:text-schola-text hover:bg-schola-subtle/50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>My Shelf</span>
            {savedCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-schola-border text-schola-text">
                {savedCount}
              </span>
            )}
          </button>

          {/* Downloads & Reading History */}
          <button
            onClick={() => setActiveTab('Downloads')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer font-sans ${
              activeTab === 'Downloads' 
                ? 'bg-[#ede5d8] text-schola-text font-bold shadow-2xs border border-[#ddcca8]' 
                : 'text-schola-muted hover:text-schola-text hover:bg-schola-subtle/50'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-schola-arc" />
            <span>Downloads & History</span>
            {downloadedCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-schola-border text-schola-text">
                {downloadedCount}
              </span>
            )}
          </button>

        </nav>

        {/* Right: Quick Tour, Network, ARC AI & Google Sign-In */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
          
          {/* Quick Tour / Help Guide */}
          {onOpenTour && (
            <button
              onClick={onOpenTour}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg border border-schola-border bg-white hover:bg-schola-subtle text-xs text-schola-text transition cursor-pointer shadow-2xs"
              title="Platform Tour & User Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-schola-arc" />
              <span className="hidden sm:inline font-medium">Guide</span>
            </button>
          )}

          {/* Online/Offline status icon (desktop) */}
          <span 
            title={isOnline ? "Online: Gemini 2.5 Flash active" : "Offline: Edge NLP active"}
            className="p-1 text-schola-muted hidden sm:inline"
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-700" /> : <WifiOff className="w-3.5 h-3.5 text-amber-700" />}
          </span>

          {/* ARC Assistant Pill Button */}
          <button
            onClick={onOpenArcAI}
            className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-schola-arc hover:bg-schola-arcHover text-white text-xs font-semibold shadow-2xs transition cursor-pointer shrink-0"
            title="ARC Intelligent Research Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>ARC AI</span>
          </button>

          {/* User Profile Avatar or Sign In With Gmail (ALWAYS VISIBLE, NEVER CUT OFF) */}
          {user ? (
            <div className="relative shrink-0">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full bg-schola-subtle border border-schola-border flex items-center justify-center font-bold text-schola-text text-xs hover:border-schola-arc transition overflow-hidden cursor-pointer"
                title={user.email || "Profile"}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User Avatar" className="w-full h-full object-cover" />
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
                      <span>Android APK v2.0 Companion</span>
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
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-schola-border bg-white hover:bg-schola-subtle text-xs font-medium text-schola-text transition cursor-pointer shadow-2xs shrink-0"
              title="Sign in with your Google account"
            >
              <LogIn className="w-3.5 h-3.5 text-schola-arc" />
              <span className="hidden sm:inline">Sign In with Gmail</span>
              <span className="sm:hidden font-semibold">Sign In</span>
            </button>
          )}

        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Ultra-responsive, touch friendly, avoids top clutter) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-schola-border px-2 py-1 flex items-center justify-around text-[10px] select-none shadow-lg">
        
        {/* Library Reader */}
        <button
          onClick={() => setActiveTab('Library')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition cursor-pointer ${
            activeTab === 'Library' 
              ? 'text-schola-arc font-bold' 
              : 'text-schola-muted hover:text-schola-text'
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span>Library</span>
        </button>

        {/* Harvest */}
        <button
          onClick={() => setActiveTab('Harvest')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition cursor-pointer ${
            activeTab === 'Harvest' 
              ? 'text-schola-arc font-bold' 
              : 'text-schola-muted hover:text-schola-text'
          }`}
        >
          <Layers className="w-4 h-4 mb-0.5" />
          <span>Harvest</span>
        </button>

        {/* My Shelf */}
        <button
          onClick={() => setActiveTab('Shelf')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition cursor-pointer relative ${
            activeTab === 'Shelf' 
              ? 'text-schola-arc font-bold' 
              : 'text-schola-muted hover:text-schola-text'
          }`}
        >
          <Bookmark className="w-4 h-4 mb-0.5" />
          <span>My Shelf</span>
          {savedCount > 0 && (
            <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-schola-arc text-white text-[9px] flex items-center justify-center font-mono">
              {savedCount}
            </span>
          )}
        </button>

        {/* Downloads & History */}
        <button
          onClick={() => setActiveTab('Downloads')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition cursor-pointer relative ${
            activeTab === 'Downloads' 
              ? 'text-schola-arc font-bold' 
              : 'text-schola-muted hover:text-schola-text'
          }`}
        >
          <HardDrive className="w-4 h-4 mb-0.5" />
          <span>Downloads</span>
          {downloadedCount > 0 && (
            <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-schola-arc text-white text-[9px] flex items-center justify-center font-mono">
              {downloadedCount}
            </span>
          )}
        </button>

      </nav>
    </>
  );
};
