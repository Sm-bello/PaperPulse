import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FolderPlus, 
  BookOpen, 
  Download, 
  Bookmark, 
  Clock, 
  Search, 
  Smartphone, 
  CheckCircle2, 
  X, 
  Plus, 
  Trash2 
} from 'lucide-react';
import type { Paper, CustomFolder } from '../types';

interface SidebarProps {
  activeFolder: string;
  onSelectFolder: (folder: string) => void;
  targetDirHandle: any;
  onSelectTargetDir: () => void;
  savedPapers: Paper[];
  downloadedCount: number;
  historyCount: number;
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeFolder,
  onSelectFolder,
  targetDirHandle,
  onSelectTargetDir,
  savedPapers,
  downloadedCount,
  historyCount,
  isOpen,
  onCloseMobile,
}) => {
  const [customFolders, setCustomFolders] = useState<CustomFolder[]>([]);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Load custom folders from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('theschola_custom_folders');
      if (raw) setCustomFolders(JSON.parse(raw));
    } catch {}
  }, []);

  const saveCustomFolders = (folders: CustomFolder[]) => {
    setCustomFolders(folders);
    try {
      localStorage.setItem('theschola_custom_folders', JSON.stringify(folders));
    } catch {}
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFolderName.trim();
    if (!trimmed) return;

    const newFolder: CustomFolder = {
      id: `folder-${Date.now()}`,
      name: trimmed,
      createdAt: new Date().toISOString(),
    };

    saveCustomFolders([...customFolders, newFolder]);
    setNewFolderName('');
    setIsCreatingFolder(false);
    onSelectFolder(newFolder.name);
  };

  const handleDeleteFolder = (e: React.MouseEvent, folderId: string, folderName: string) => {
    e.stopPropagation();
    const updated = customFolders.filter(f => f.id !== folderId);
    saveCustomFolders(updated);
    if (activeFolder === folderName) {
      onSelectFolder('Library');
    }
  };

  if (!isOpen) return null;

  // Real, purposeful sections with actual counts
  const mainNavSections = [
    { name: 'Library', label: 'Library & Reader', icon: BookOpen, count: null },
    { name: 'Discovery & Harvest', label: 'Discovery & Harvest', icon: Search, count: null },
    { name: 'Downloads', label: 'Downloads & PDFs', icon: Download, count: downloadedCount },
    { name: 'My Saved Shelf', label: 'My Saved Shelf', icon: Bookmark, count: savedPapers.length },
    { name: 'History', label: 'Reading History', icon: Clock, count: historyCount },
  ];

  return (
    <aside className="w-64 sm:w-68 border-r border-schola-border bg-schola-panel flex flex-col justify-between select-none z-30 shrink-0 transition-all duration-300">
      
      {/* Top Header Controls */}
      <div>
        <div className="h-11 px-3 border-b border-schola-border flex items-center justify-between text-schola-muted">
          <div className="flex items-center space-x-1.5 font-serif font-semibold text-xs text-schola-text">
            <Folder className="w-4 h-4 text-schola-arc" />
            <span>Workspace Collections</span>
          </div>

          <div className="flex items-center space-x-1">
            {onCloseMobile && (
              <button 
                onClick={onCloseMobile}
                className="p-1 hover:text-schola-text rounded transition md:hidden cursor-pointer"
                title="Close Sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Primary Sections (Real items & real counts) */}
        <div className="p-2 space-y-1 text-xs">
          {mainNavSections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeFolder === sec.name;
            return (
              <button
                key={sec.name}
                onClick={() => {
                  onSelectFolder(sec.name);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition cursor-pointer group ${
                  isActive 
                    ? 'bg-[#ede5d8] text-schola-text font-bold shadow-2xs border border-[#ddcca8]' 
                    : 'text-schola-muted hover:bg-schola-subtle/50 hover:text-schola-text'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-schola-arc' : 'text-schola-muted'}`} />
                  <span className="truncate">{sec.label}</span>
                </div>
                {sec.count !== null && sec.count > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-schola-arc text-white' : 'bg-schola-border text-schola-text'
                  }`}>
                    {sec.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom User Folders Section */}
        <div className="px-3 pt-3 pb-1 border-t border-schola-border flex items-center justify-between text-[11px] font-mono text-schola-muted uppercase">
          <span>My Folders</span>
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="p-1 hover:text-schola-text hover:bg-schola-subtle rounded transition cursor-pointer"
            title="Create Custom Folder"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Create Folder Input */}
        {isCreatingFolder && (
          <form onSubmit={handleCreateFolder} className="p-2">
            <div className="flex items-center space-x-1">
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name (e.g. Thesis)..."
                className="flex-1 px-2.5 py-1 rounded-md bg-white border border-schola-border text-xs text-schola-text focus:outline-none focus:ring-1 focus:ring-schola-arc"
              />
              <button
                type="submit"
                className="px-2 py-1 bg-schola-arc text-white rounded-md text-xs font-semibold"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingFolder(false)}
                className="p-1 text-schola-muted hover:text-schola-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Custom Folder List */}
        <div className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-22rem)] text-xs">
          {customFolders.length === 0 && !isCreatingFolder && (
            <p className="text-[11px] text-schola-muted/70 px-2 py-2 italic font-serif">
              No custom folders yet. Tap + to organize your papers.
            </p>
          )}

          {customFolders.map((f) => {
            const isActive = activeFolder === f.name;
            const folderCount = savedPapers.filter(p => p.folderId === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => {
                  onSelectFolder(f.name);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition cursor-pointer group ${
                  isActive 
                    ? 'bg-[#ede5d8] text-schola-text font-bold shadow-2xs border border-[#ddcca8]' 
                    : 'text-schola-muted hover:bg-schola-subtle/50 hover:text-schola-text'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <Folder className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-schola-arc' : 'text-schola-muted'}`} />
                  <span className="truncate">{f.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {folderCount > 0 && (
                    <span className="text-[10px] font-mono text-schola-muted">
                      {folderCount}
                    </span>
                  )}
                  <button
                    onClick={(e) => handleDeleteFolder(e, f.id, f.name)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-600 transition"
                    title="Delete folder"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Folder Linking & Mobile Offline Pill */}
      <div className="p-3 border-t border-schola-border bg-schola-panel/80 space-y-2">
        <button
          onClick={onSelectTargetDir}
          className="w-full flex items-center justify-center space-x-1.5 py-2 text-xs text-schola-text font-medium transition border border-schola-border rounded-lg bg-white hover:bg-schola-subtle cursor-pointer shadow-2xs"
        >
          <FolderPlus className="w-3.5 h-3.5 text-schola-arc" />
          <span className="truncate">{targetDirHandle ? `Linked: ${targetDirHandle.name}` : 'Link Laptop Folder'}</span>
        </button>

        <div className="flex items-center justify-between text-[11px] text-schola-muted font-mono pt-1">
          <span className="flex items-center space-x-1">
            <Smartphone className="w-3 h-3 text-schola-arc" />
            <span>Android APK v2.0</span>
          </span>
          <span className="text-emerald-700 font-semibold flex items-center space-x-0.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Ready</span>
          </span>
        </div>
      </div>

    </aside>
  );
};
