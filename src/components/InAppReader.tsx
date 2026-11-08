import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  Download, 
  Sparkles, 
  Moon, 
  Sun, 
  Eye, 
  Bookmark, 
  Printer, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Menu,
  Maximize2
} from 'lucide-react';
import type { Paper, AISummary } from '../types';
import { downloadSinglePaper } from '../services/downloader';

interface InAppReaderProps {
  paper: Paper;
  summary?: AISummary | null;
  onBack: () => void;
  onBookmark: (paper: Paper) => void;
  isBookmarked: boolean;
  onOpenSummaryModal?: () => void;
}

export const InAppReader: React.FC<InAppReaderProps> = ({
  paper,
  onBack,
  onBookmark,
  isBookmarked,
  onOpenSummaryModal,
}) => {
  const [readerTheme, setReaderTheme] = useState<'normal' | 'dark' | 'sepia'>('normal');
  const [zoomLevel, setZoomLevel] = useState<number>(85);
  const [downloading, setDownloading] = useState(false);

  const pdfUrl = paper.pdfUrl || paper.landingPageUrl || "";

  const handleDownload = async () => {
    setDownloading(true);
    await downloadSinglePaper(paper);
    setDownloading(false);
  };

  const getViewerStyle = () => {
    switch (readerTheme) {
      case 'dark':
        return 'filter invert-[0.92] hue-rotate-180 contrast-125 bg-slate-900';
      case 'sepia':
        return 'filter sepia-[0.35] brightness-[0.95] contrast-[0.95] bg-[#faf3e8]';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-schola-bg relative select-none">
      
      {/* Background Watermark (THE SCHOLA) */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-center bg-contain opacity-[0.032] pointer-events-none"
        style={{ backgroundImage: `url('/logo.png')` }}
      />

      {/* Document Tab Header (Matching Image 2) */}
      <div className="h-9 px-4 border-b border-schola-border bg-schola-panel/60 flex items-center justify-between text-xs text-schola-muted">
        <div className="flex items-center space-x-2 truncate">
          <button 
            onClick={onBack}
            className="p-1 rounded hover:text-schola-text hover:bg-schola-subtle transition"
            title="Back to Harvest"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <span className="font-serif font-medium text-schola-text truncate max-w-md lg:max-w-xl">
            {paper.title}
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-schola-subtle text-schola-muted">
            {paper.venue}
          </span>
        </div>
      </div>

      {/* PDF Sub-Toolbar (Matching Image 2: [三 Name 1/27 - 85% + [] ↺ ⬇ 🖨 ⋮]) */}
      <div className="h-10 px-4 bg-[#23272d] text-slate-300 flex items-center justify-between text-xs select-none shadow-xs">
        
        {/* Left Toolbar Items */}
        <div className="flex items-center space-x-3 truncate">
          <button className="text-slate-400 hover:text-white transition">
            <Menu className="w-4 h-4" />
          </button>
          <span className="font-sans text-xs text-slate-200 truncate max-w-[180px] sm:max-w-xs">
            {paper.title.slice(0, 35)}...
          </span>
          <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
            1 / 27
          </span>
        </div>

        {/* Center Zoom Controls */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <button 
            onClick={() => setZoomLevel(Math.max(50, zoomLevel - 15))}
            className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="w-10 text-center text-slate-300 text-[11px]">{zoomLevel}%</span>
          <button 
            onClick={() => setZoomLevel(Math.min(150, zoomLevel + 15))}
            className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setZoomLevel(100)}
            className="p-1 text-slate-400 hover:text-white transition hidden sm:inline cursor-pointer"
            title="Fit to window"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button 
            className="p-1 text-slate-400 hover:text-white transition hidden sm:inline"
            title="Rotate"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center space-x-2">
          
          {/* Eye-Care & Dark Theme Selector */}
          <div className="flex items-center bg-slate-800 rounded-md p-0.5 text-xs mr-1">
            <button
              onClick={() => setReaderTheme('normal')}
              className={`p-1 rounded ${readerTheme === 'normal' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
              title="Standard Light"
            >
              <Sun className="w-3 h-3" />
            </button>
            <button
              onClick={() => setReaderTheme('sepia')}
              className={`p-1 rounded ${readerTheme === 'sepia' ? 'bg-amber-800 text-amber-100' : 'text-slate-400'}`}
              title="Eye-care Sepia"
            >
              <Eye className="w-3 h-3" />
            </button>
            <button
              onClick={() => setReaderTheme('dark')}
              className={`p-1 rounded ${readerTheme === 'dark' ? 'bg-slate-900 text-sky-300' : 'text-slate-400'}`}
              title="Night Dark"
            >
              <Moon className="w-3 h-3" />
            </button>
          </div>

          {/* ARC Action Pill */}
          {onOpenSummaryModal && (
            <button
              onClick={onOpenSummaryModal}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-schola-arc hover:bg-schola-arcHover text-white text-[11px] font-semibold transition cursor-pointer"
              title="Open ARC AI Synthesis"
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">ARC Notes</span>
            </button>
          )}

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Print */}
          <button
            onClick={() => window.print()}
            className="p-1 text-slate-400 hover:text-white transition hidden sm:inline"
            title="Print"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {/* Bookmark */}
          <button
            onClick={() => onBookmark(paper)}
            className={`p-1 text-slate-400 hover:text-white transition ${isBookmarked ? 'text-amber-400' : ''}`}
            title={isBookmarked ? "Bookmarked" : "Bookmark"}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* External tab */}
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-slate-400 hover:text-white transition"
              title="Open in external browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

        </div>

      </div>

      {/* Main Document Frame */}
      <div className="flex-1 w-full h-full bg-[#525659] relative flex items-center justify-center overflow-auto p-2 sm:p-4">
        {pdfUrl ? (
          <div 
            className="w-full h-full max-w-4xl bg-white shadow-2xl rounded-sm overflow-hidden transition-all duration-300"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          >
            <iframe
              src={pdfUrl}
              title={paper.title}
              className={`w-full h-full border-none transition-all duration-300 ${getViewerStyle()}`}
            />
          </div>
        ) : (
          <div className="text-center p-8 max-w-md bg-white rounded-xl shadow-lg border border-schola-border">
            <h3 className="font-serif text-lg font-bold text-schola-text mb-2">Direct Viewer Unavailable</h3>
            <p className="text-xs text-schola-muted mb-4">
              Some publishers restrict iframe embedding. You can read the synthesized ARC AI Summary or open via the publisher portal.
            </p>
            {paper.landingPageUrl && (
              <a
                href={paper.landingPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-schola-arc hover:bg-schola-arcHover text-white text-xs font-semibold shadow-xs transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open via Publisher Portal</span>
              </a>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
