import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  BookOpen, 
  Copy, 
  ExternalLink, 
  Check, 
  Folder, 
  ChevronRight,
  Download,
  Bookmark
} from 'lucide-react';
import type { Paper, AISummary } from '../types';
import { downloadSinglePaper } from '../services/downloader';

interface PaperDetailsPanelProps {
  paper: Paper | null;
  summary: AISummary | null;
  onOpenSummaryModal: () => void;
  onReadPaper: () => void;
  onBookmark: () => void;
  isBookmarked: boolean;
}

export const PaperDetailsPanel: React.FC<PaperDetailsPanelProps> = ({
  paper,
  onOpenSummaryModal,
  onReadPaper,
  onBookmark,
  isBookmarked,
}) => {
  const [copiedDoi, setCopiedDoi] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (!paper) {
    return (
      <aside className="w-80 border-l border-schola-border bg-schola-panel p-6 flex flex-col items-center justify-center text-center text-schola-muted">
        <div className="w-16 h-16 opacity-30 mb-3">
          <img src="/logo.png" alt="THE SCHOLA" className="w-full h-full object-contain filter grayscale" />
        </div>
        <p className="font-serif text-base font-semibold text-schola-text mb-1">Select a Paper</p>
        <p className="text-xs text-schola-muted">
          Click any research item to inspect metadata, trigger ARC AI actions, and read in-app.
        </p>
      </aside>
    );
  }

  if (collapsed) {
    return (
      <aside className="w-12 border-l border-schola-border bg-schola-panel flex flex-col items-center py-4">
        <button 
          onClick={() => setCollapsed(false)}
          className="p-1.5 rounded-lg text-schola-muted hover:text-schola-text hover:bg-schola-subtle transition"
          title="Expand Paper Details"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
      </aside>
    );
  }

  const handleCopyDoi = () => {
    if (paper.doi) {
      navigator.clipboard.writeText(paper.doi);
      setCopiedDoi(true);
      setTimeout(() => setCopiedDoi(false), 2000);
    }
  };

  return (
    <aside className="w-80 lg:w-84 border-l border-schola-border bg-schola-panel flex flex-col justify-between overflow-y-auto select-none relative">
      
      {/* Background Watermark */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-center bg-contain opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: `url('/logo.png')` }}
      />

      <div className="p-4 space-y-5 relative z-10 text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-schola-border">
          <h3 className="font-serif text-sm font-bold text-schola-text">Paper Details</h3>
          <div className="flex items-center space-x-1 text-schola-muted">
            <button 
              onClick={onBookmark}
              className={`p-1 rounded hover:text-schola-text transition ${isBookmarked ? 'text-schola-arc' : ''}`}
              title={isBookmarked ? 'Saved to Shelf' : 'Save to Shelf'}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>
            <button 
              onClick={() => setCollapsed(true)}
              className="p-1 rounded hover:text-schola-text transition"
              title="Collapse Panel"
            >
              <Folder className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ARC Actions Section (Matching Image 2) */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase text-schola-muted tracking-wider">
            ARC Actions
          </span>
          <div className="space-y-1.5">
            <button
              onClick={onOpenSummaryModal}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg bg-schola-subtle hover:bg-schola-border text-schola-text font-medium text-xs border border-schola-border transition text-left cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-schola-arc" />
              <span>View Summary & Findings</span>
            </button>

            <button
              onClick={onOpenSummaryModal}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg bg-schola-subtle hover:bg-schola-border text-schola-text font-medium text-xs border border-schola-border transition text-left cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-schola-muted" />
              <span>View Methods & Architecture</span>
            </button>

            <button
              onClick={onReadPaper}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg bg-schola-subtle hover:bg-schola-border text-schola-text font-medium text-xs border border-schola-border transition text-left cursor-pointer shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-schola-muted" />
              <span>Read Full Document (In-App)</span>
            </button>
          </div>
        </div>

        {/* Paper Details Form Fields (Matching Image 2) */}
        <div className="space-y-3 pt-2">
          
          {/* Title */}
          <div>
            <label className="block text-[11px] text-schola-muted mb-1 font-mono">Title</label>
            <div className="p-2.5 rounded-lg bg-white/80 border border-schola-border text-schola-text text-xs leading-snug line-clamp-3 font-serif font-medium">
              {paper.title}
            </div>
          </div>

          {/* Authors */}
          <div>
            <label className="block text-[11px] text-schola-muted mb-1 font-mono">Authors</label>
            <div className="p-2 rounded-lg bg-white/80 border border-schola-border text-schola-text text-xs truncate">
              {paper.authors.join(", ")}
            </div>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[11px] text-schola-muted mb-1 font-mono">Year</label>
            <div className="p-2 rounded-lg bg-white/80 border border-schola-border text-schola-text text-xs font-mono">
              {paper.publicationYear}
            </div>
          </div>

          {/* DOI */}
          <div>
            <label className="block text-[11px] text-schola-muted mb-1 font-mono">DOI</label>
            <div className="flex items-center space-x-1.5">
              <input
                type="text"
                readOnly
                value={paper.doi || "N/A"}
                className="flex-1 p-2 rounded-lg bg-white/80 border border-schola-border text-schola-text text-xs font-mono truncate focus:outline-none"
              />
              <button
                onClick={handleCopyDoi}
                title="Copy DOI"
                className="p-2 rounded-lg bg-white/80 border border-schola-border hover:bg-white text-schola-muted hover:text-schola-text transition cursor-pointer"
              >
                {copiedDoi ? <Check className="w-3.5 h-3.5 text-schola-arc" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              {paper.doi && (
                <a
                  href={paper.doi.startsWith("http") ? paper.doi : `https://doi.org/${paper.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-schola-arc text-white hover:bg-schola-arcHover transition cursor-pointer"
                  title="Open DOI Link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Journal / Venue */}
          <div>
            <label className="block text-[11px] text-schola-muted mb-1 font-mono">Journal / Venue</label>
            <div className="p-2 rounded-lg bg-white/80 border border-schola-border text-schola-text text-xs truncate font-serif">
              {paper.venue || "Academic Open Index"}
            </div>
          </div>

          {/* Volume, Issue, Pages */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] text-schola-muted mb-1 font-mono">Volume</label>
              <div className="p-1.5 rounded-lg bg-white/80 border border-schola-border text-schola-text text-xs font-mono text-center">
                7
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-schola-muted mb-1 font-mono">Issue</label>
              <div className="p-1.5 rounded-lg bg-white/80 border border-schola-border text-schola-text text-xs font-mono text-center">
                12
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-schola-muted mb-1 font-mono">Pages</label>
              <div className="p-1.5 rounded-lg bg-white/80 border border-schola-border text-schola-text text-xs font-mono text-center truncate">
                2474-248
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[11px] text-schola-muted mb-1 font-mono">Tags</label>
            <input
              type="text"
              defaultValue="aerospace, open-access, digital-twin"
              className="w-full p-2 rounded-lg bg-white/80 border border-schola-border text-schola-text text-xs font-mono focus:outline-none"
            />
          </div>

        </div>

      </div>

      {/* Footer Quick Download Action */}
      <div className="p-4 border-t border-schola-border bg-schola-panel/80">
        <button
          onClick={() => downloadSinglePaper(paper)}
          className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-schola-arc hover:bg-schola-arcHover text-white text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Save PDF to Device</span>
        </button>
      </div>

    </aside>
  );
};
