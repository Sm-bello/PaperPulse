import React from 'react';
import { 
  Folder, 
  FolderPlus, 
  RefreshCw, 
  Smartphone,
  CheckCircle2,
  X
} from 'lucide-react';
import type { Paper } from '../types';

interface SidebarProps {
  activeFolder: string;
  onSelectFolder: (folder: string) => void;
  targetDirHandle: any;
  onSelectTargetDir: () => void;
  savedPapers: Paper[];
  harvestedPapers: Paper[];
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeFolder,
  onSelectFolder,
  targetDirHandle,
  onSelectTargetDir,
  savedPapers,
  harvestedPapers,
  isOpen,
  onCloseMobile,
}) => {
  const folders = [
    { name: "Unlinked Papers", count: harvestedPapers.length || 15 },
    { name: "Drug Target Validation SIRT...", count: 0 },
    { name: "Thermal Proteome Profiling", count: 0 },
    { name: "RNA-Seq Differential Expr...", count: 0 },
    { name: "Prediction Model for SIRT4", count: 0 },
    { name: "CAD-carnitine", count: 0 },
    { name: "Cancer Genomics", count: 0 },
    { name: "Mitochondrial Gene Expre...", count: 0 },
    { name: "Metagenomics", count: 0 },
    { name: "Grants", count: 0 },
    { name: "Evo Bio Econ", count: 0 },
    { name: "Landing Gear Digital Twin", count: 12 },
    { name: "Neuromorphic SNN PHM", count: 8 },
    { name: "Rotating Detonation Engine", count: 14 },
    { name: "Avionics Blockchain ADS-B", count: 9 },
    { name: "Decentralized UAV Swarms", count: 7 },
    { name: "My Saved Shelf", count: savedPapers.length },
  ];

  if (!isOpen) return null;

  return (
    <aside className="w-64 sm:w-68 border-r border-schola-border bg-schola-panel flex flex-col justify-between select-none z-30 shrink-0 transition-all duration-300">
      
      {/* Top Header Controls */}
      <div>
        <div className="h-11 px-3 border-b border-schola-border flex items-center justify-between text-schola-muted">
          <div className="flex items-center space-x-1.5 font-serif font-semibold text-xs text-schola-text">
            <Folder className="w-4 h-4 text-schola-arc" />
            <span>Research Folders</span>
          </div>

          <div className="flex items-center space-x-1">
            <button 
              onClick={() => window.location.reload()}
              className="p-1 hover:text-schola-text rounded transition cursor-pointer" 
              title="Refresh collections"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
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

        {/* Folder List */}
        <div className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-14rem)] text-xs">
          {folders.map((f, idx) => {
            const isActive = activeFolder === f.name;
            return (
              <button
                key={idx}
                onClick={() => {
                  onSelectFolder(f.name);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition cursor-pointer group ${
                  isActive 
                    ? 'bg-schola-subtle text-schola-text font-semibold shadow-2xs border border-schola-border/80' 
                    : 'text-schola-muted hover:bg-schola-subtle/50 hover:text-schola-text'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className="text-[10px] text-schola-lightMuted font-mono">›</span>
                  <Folder className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-schola-arc' : 'text-schola-muted/80'}`} />
                  <span className="truncate">{f.name}</span>
                </div>
                <span className="text-[10px] font-mono text-schola-lightMuted group-hover:text-schola-muted">
                  {f.count}
                </span>
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
          <span className="truncate">{targetDirHandle ? `Linked: ${targetDirHandle.name}` : 'Link Device Folder'}</span>
        </button>

        <div className="flex items-center justify-between text-[11px] text-schola-muted font-mono pt-1">
          <span className="flex items-center space-x-1">
            <Smartphone className="w-3 h-3 text-schola-arc" />
            <span>APK v2.0 Ready</span>
          </span>
          <span className="text-emerald-700 font-semibold flex items-center space-x-0.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Offline</span>
          </span>
        </div>
      </div>

    </aside>
  );
};
