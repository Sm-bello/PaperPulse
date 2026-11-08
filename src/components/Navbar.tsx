import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Home, 
  Rss, 
  BookOpen, 
  FileText, 
  FlaskConical, 
  Settings, 
  Bell, 
  LogIn, 
  LogOut, 
  Wifi, 
  WifiOff,
  Smartphone
} from 'lucide-react';
import type { UserProfile } from '../types';
import { signInWithGoogle, logOut } from '../services/firebase';

interface NavbarProps {
  user: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  targetDirHandle: any;
  onSelectTargetDir: () => void;
  onOpenArcAI: () => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenArcAI,
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
    <header className="h-14 border-b border-schola-border bg-schola-panel px-3 sm:px-5 flex items-center justify-between select-none">
      
      {/* Left: Window Dots & Logo */}
      <div className="flex items-center space-x-3.5">
        
        {/* macOS Window Controls */}
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-2xs cursor-pointer" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-2xs cursor-pointer" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-2xs cursor-pointer" />
        </div>

        {/* Brand Logo (THE SCHOLA) */}
        <div 
          onClick={() => setActiveTab('Library')}
          className="flex items-center space-x-2.5 cursor-pointer pl-1 group"
        >
          <div className="w-7 h-7 rounded-md bg-white border border-schola-border shadow-2xs flex items-center justify-center overflow-hidden p-0.5">
            <img src="/logo.png" alt="THE SCHOLA" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-serif tracking-widest text-sm font-bold text-schola-text uppercase">
                THE SCHOLA
              </span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-schola-subtle text-schola-muted border border-schola-border hidden lg:inline">
                PaperPulse
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Center Nav: Home, Feed, Library, Notes, Lab, Settings */}
      <nav className="hidden md:flex items-center space-x-1 text-xs">
        {[
          { name: 'Home', icon: Home },
          { name: 'Feed', icon: Rss },
          { name: 'Library', icon: BookOpen, count: savedCount },
          { name: 'Notes', icon: FileText },
          { name: 'Lab', icon: FlaskConical },
          { name: 'Settings', icon: Settings },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer font-sans ${
                isActive 
                  ? 'bg-schola-subtle text-schola-text font-semibold shadow-2xs border border-schola-border' 
                  : 'text-schola-muted hover:text-schola-text hover:bg-schola-subtle/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.name}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-schola-border text-schola-text">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: Pings, ARC Pill, User Avatar */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        
        {/* Network status icon */}
        <span 
          title={isOnline ? "Online: Gemini API ready" : "Offline: Edge NLP active"}
          className="p-1 text-schola-muted hidden sm:inline"
        >
          {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-700" /> : <WifiOff className="w-3.5 h-3.5 text-amber-700" />}
        </span>

        {/* Pings notification */}
        <button className="flex items-center space-x-1 px-2 py-1 text-xs text-schola-muted hover:text-schola-text rounded-md hover:bg-schola-subtle transition">
          <Bell className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Pings</span>
        </button>

        {/* ARC Pill Button (Matching Image 2) */}
        <button
          onClick={onOpenArcAI}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-schola-arc hover:bg-schola-arcHover text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
          title="ARC Intelligent Research Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
          <span>ARC</span>
        </button>

        {/* User Avatar Circle */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-7 h-7 rounded-full bg-schola-subtle border border-schola-border flex items-center justify-center font-bold text-schola-text text-xs hover:border-schola-arc transition overflow-hidden"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
              ) : (
                <span>{(user.displayName || user.email || 'P')[0].toUpperCase()}</span>
              )}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl bg-white border border-schola-border shadow-xl py-2 text-xs z-50">
                <div className="px-3 py-2 border-b border-schola-border">
                  <p className="font-semibold text-schola-text">{user.displayName || "Researcher"}</p>
                  <p className="text-[11px] text-schola-muted font-mono truncate">{user.email}</p>
                </div>
                <div className="px-3 py-2 text-[11px] text-schola-muted space-y-1">
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
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-1.5 text-rose-700 hover:bg-rose-50 text-left cursor-pointer"
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
            onClick={signInWithGoogle}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-schola-border bg-white hover:bg-schola-subtle text-xs font-medium text-schola-text transition cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-schola-arc" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}

      </div>
    </header>
  );
};
