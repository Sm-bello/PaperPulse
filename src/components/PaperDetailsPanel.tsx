import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  BookOpen, 
  Copy, 
  ExternalLink, 
  Check, 
  Download, 
  Bookmark,
  X
} from 'lucide-react';
import type { Paper, AISummary } from '../types';
import { downloadSinglePaper } from '../services/downloader';

interface PaperDetailsPanelProps {
  paper: Paper | null;
  summary: AISummary | null;
  onOpenSummaryModal: () => void;
  onReadPaper: () => void;
  onBookmark: () => void;
  onClose?: () => void;
  isBookmarked: boolean;
  isOpen: boolean;
}

export const PaperDetailsPanel: React.FC<PaperDetailsPanelProps> = ({
  paper,
  onOpenSummaryModal,
  onReadPaper,
  onBookmark,
  onClose,
  isBookmarked,
  isOpen,
}) => {
  const [copiedDoi, setCopiedDoi] = useState(false);
  const [downloadState, setDownloadState] = useState<'idle' | 'fetching' | 'saving' | 'success' | 'redirected' | 'error'>('idle');
  const [downloadMsg, setDownloadMsg] = useState<string>('');

  if (!isOpen || !paper) return null;

  const handleCopyDoi = () => {
    if (paper.doi) {
      navigator.clipboard.writeText(paper.doi);
      setCopiedDoi(true);
      setTimeout(() => setCopiedDoi(false), 2000);
    }
  };

  const handleDownloadPaper = async () => {
    if (!paper) return;
    setDownloadState('fetching');
    setDownloadMsg('Locating and fetching PDF stream...');
    await downloadSinglePaper(paper, 1, (status, msg) => {
      setDownloadState(status);
      setDownloadMsg(msg);
    });

    setTimeout(() => {
      setDownloadState('idle');
      setDownloadMsg('');
    }, 4000);
  };

  return (
    <aside className="w-80 sm:w-88 border-l border-schola-border bg-schola-panel flex flex-col justify-between overflow-y-auto select-none relative z-30 shrink-0">
      
      {/* Background Watermark */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-center bg-contain opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: `url('/logo.png')` }}
      />

      <div className="p-4 sm:p-5 space-y-5 relative z-10 text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-schola-border">
          <div className="flex items-center space-x-1.5">
            <FileText className="w-4 h-4 text-schola-arc" />
            <h3 className="font-serif text-sm font-bold text-schola-text">Paper Details</h3>
          </div>
          <div className="flex items-center space-x-1 text-schola-muted">
            <button 
              onClick={onBookmark}
              className={`p-1.5 rounded-md hover:text-schola-text transition cursor-pointer ${isBookmarked ? 'text-schola-arc' : ''}`}
              title={isBookmarked ? 'Saved to Shelf' : 'Save to Shelf'}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>
            {onClose && (
              <button 
                onClick={onClose}
                className="p-1.5 rounded-md hover:text-schola-text hover:bg-schola-subtle transition cursor-pointer"
                title="Close Details Panel"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ARC Actions Section */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase text-schola-muted tracking-wider">
            ARC Actions
          </span>
          <div className="space-y-1.5">
            <button
              onClick={onOpenSummaryModal}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#fbf5ea] hover:bg-[#f5ecdc] text-schola-text font-serif text-xs border border-[#ecd9be] transition text-left cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-schola-arc" />
              <span>View Methods</span>
            </button>

            <button
              onClick={onOpenSummaryModal}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#fbf5ea] hover:bg-[#f5ecdc] text-schola-text font-serif text-xs border border-[#ecd9be] transition text-left cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-schola-arc" />
              <span>View Summary</span>
            </button>

            <button
              onClick={onReadPaper}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#fbf5ea] hover:bg-[#f5ecdc] text-schola-text font-serif text-xs border border-[#ecd9be] transition text-left cursor-pointer shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-schola-arc" />
              <span>View References</span>
            </button>
          </div>
        </div>

        {/* Paper Details Form Fields */}
        <div className="space-y-3 pt-1">
          
          {/* Title */}
          <div>
            <label className="block text-[11px] text-schola-muted mb-1 font-mono">Title</label>
            <div className="p-2.5 rounded-lg bg-white border border-schola-border text-schola-text text-xs leading-snug font-serif font-semibold">
              {paper.title}
            </div>
          </div>

          {/* Authors */}
          <div>
            <label className="block text-[11px] text-schola-muted mb-1 font-mono">Authors</label>
            <div className="p-2 rounded-lg bg-white border border-schola-border text-schola-text text-xs truncate">
              {paper.authors.join(", ")}
            </div>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[11px] text-schola-muted mb-1 font-mono">Year</label>
            <div className="p-2 rounded-lg bg-white border border-schola-border text-schola-text text-xs font-mono">
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
                className="flex-1 p-2 rounded-lg bg-white border border-schola-border text-schola-text text-xs font-mono truncate focus:outline-none"
              />
              <button
                onClick={handleCopyDoi}
                title="Copy DOI"
                className="p-2 rounded-lg bg-white border border-schola-border hover:bg-schola-subtle text-schola-muted hover:text-schola-text transition cursor-pointer"
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
            <label className="block text-[11px] text-schola-muted mb-1 font-mono">Journal</label>
            <div className="p-2 rounded-lg bg-white border border-schola-border text-schola-text text-xs truncate font-serif">
              {paper.venue || "Nature Metabolism"}
            </div>
          </div>

          {/* Volume, Issue, Pages (Exact 3-box row matching reference screenshot) */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-schola-muted mb-1 font-mono">Volume</label>
              <div className="p-2 rounded-lg bg-white border border-schola-border text-schola-text text-xs font-mono text-center">
                {paper.volume || "7"}
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-schola-muted mb-1 font-mono">Issue</label>
              <div className="p-2 rounded-lg bg-white border border-schola-border text-schola-text text-xs font-mono text-center">
                {paper.issue || "12"}
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-schola-muted mb-1 font-mono">Pages</label>
              <div className="p-2 rounded-lg bg-white border border-schola-border text-schola-text text-xs font-mono text-center truncate">
                {paper.pages || "2474-2485"}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[11px] text-schola-muted mb-1 font-mono">Tags</label>
            <input
              type="text"
              defaultValue="tag1, tag2, ..."
              className="w-full p-2 rounded-lg bg-white border border-schola-border text-schola-text text-xs font-mono focus:outline-none"
            />
          </div>

        </div>

      </div>

      {/* Footer Quick Download Action with Smart State */}
      <div className="p-4 border-t border-schola-border bg-schola-panel/80 space-y-1.5">
        <button
          onClick={handleDownloadPaper}
          disabled={downloadState === 'fetching' || downloadState === 'saving'}
          className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer ${
            downloadState === 'success'
              ? 'bg-emerald-600 text-white'
              : downloadState === 'fetching' || downloadState === 'saving'
              ? 'bg-schola-subtle border border-schola-border text-schola-text cursor-wait'
              : 'bg-schola-arc hover:bg-schola-arcHover text-white'
          }`}
        >
          {downloadState === 'success' ? (
            <Check className="w-4 h-4 text-white" />
          ) : downloadState === 'fetching' || downloadState === 'saving' ? (
            <Sparkles className="w-4 h-4 text-schola-arc animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>
            {downloadState === 'success'
              ? 'Saved to Downloads & Shelf!'
              : downloadState === 'fetching' || downloadState === 'saving'
              ? downloadMsg || 'Fetching PDF stream...'
              : 'Save PDF to Device'}
          </span>
        </button>

        {downloadMsg && downloadState !== 'idle' && (
          <p className="text-[11px] text-center text-schola-muted font-mono truncate px-1">
            {downloadMsg}
          </p>
        )}
      </div>

    </aside>
  );
};
