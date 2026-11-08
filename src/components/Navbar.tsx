import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  FolderCheck, 
  FolderPlus, 
  Wifi, 
  WifiOff, 
  LogIn, 
  LogOut, 
  Bookmark, 
  Layers,
  Smartphone
} from 'lucide-react';
import type { UserProfile } from '../types';
import { signInWithGoogle, logOut } from '../services/firebase';

interface NavbarProps {
  user: UserProfile | null;
  activeTab: 'harvest' | 'shelf' | 'reader';
  setActiveTab: (tab: 'harvest' | 'shelf' | 'reader') => void;
  targetDirHandle: any;
  onSelectTargetDir: () => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  targetDirHandle,
  onSelectTargetDir,
  savedCount
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('harvest')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 ring-1 ring-sky-400/30">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Paper<span className="text-sky-400">Pulse</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800/60 font-mono">
                v2.0 Web & Mobile
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400 font-mono">
              Autonomous Research Engine & Reader
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-sm">
          <button
            onClick={() => setActiveTab('harvest')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'harvest' 
                ? 'bg-sky-500 text-white shadow-md font-medium' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Harvest</span>
          </button>

          <button
            onClick={() => setActiveTab('shelf')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'shelf' 
                ? 'bg-sky-500 text-white shadow-md font-medium' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span className="hidden sm:inline">My Shelf</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 text-[11px] rounded-full bg-sky-900/80 text-sky-200 font-mono">
                {savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Section: Folder Target, Online Pill & Auth */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Target Folder Selector (Desktop only) */}
          {window.showDirectoryPicker && (
            <button
              onClick={onSelectTargetDir}
              title={targetDirHandle ? `Connected folder: ${targetDirHandle.name}` : "Pick laptop folder to save papers into"}
              className={`hidden lg:flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all ${
                targetDirHandle 
                  ? 'border-emerald-600/40 bg-emerald-950/30 text-emerald-300' 
                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
              }`}
            >
              {targetDirHandle ? (
                <>
                  <FolderCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate max-w-[110px]">{targetDirHandle.name}</span>
                </>
              ) : (
                <>
                  <FolderPlus className="w-3.5 h-3.5 text-sky-400" />
                  <span>Set Save Folder</span>
                </>
              )}
            </button>
          )}

          {/* Network Mode Pill */}
          <div 
            title={isOnline ? "Online: Gemini 2.5 Flash active" : "Offline: Local Edge NLP engine active"}
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs border font-mono ${
              isOnline 
                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400' 
                : 'bg-amber-950/40 border-amber-800/50 text-amber-400'
            }`}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span className="text-[11px]">{isOnline ? 'Online AI' : 'Offline NLP'}</span>
          </div>

          {/* User Sign In / Profile */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
              >
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || "User"} 
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-sky-500/50" 
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-white text-xs">
                    {(user.displayName || user.email || "U")[0].toUpperCase()}
                  </div>
                )}
                <span className="hidden xl:inline text-xs font-medium text-slate-200 truncate max-w-[120px]">
                  {user.displayName || user.email?.split("@")[0]}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 text-sm z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="font-semibold text-slate-200">{user.displayName || "Researcher"}</p>
                    <p className="text-xs text-slate-400 font-mono truncate">{user.email}</p>
                  </div>

                  <div className="px-4 py-2 text-xs text-slate-400">
                    <p className="flex items-center space-x-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                      <span>Android APK & PWA Ready</span>
                    </p>
                  </div>

                  <div className="border-t border-slate-800 mt-1 pt-1">
                    <button
                      onClick={() => {
                        logOut();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-rose-400 hover:bg-rose-950/30 text-xs text-left"
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
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-medium shadow-md shadow-sky-500/20 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In with Gmail</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
