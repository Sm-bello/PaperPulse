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
  AlertCircle
} from 'lucide-react';
import type { Paper, AISummary } from '../types';
import { downloadSinglePaper } from '../services/downloader';

interface InAppReaderProps {
  paper: Paper;
  summary: AISummary | null;
  onBack: () => void;
  onBookmark: (paper: Paper) => void;
  isBookmarked: boolean;
}

export const InAppReader: React.FC<InAppReaderProps> = ({
  paper,
  summary,
  onBack,
  onBookmark,
  isBookmarked,
}) => {
  const [readerTheme, setReaderTheme] = useState<'normal' | 'dark' | 'sepia'>('dark');
  const [showSummaryDrawer, setShowSummaryDrawer] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // PDF display URL (direct or via PDF preview viewer)
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
        return 'filter sepia-[0.4] brightness-[0.95] contrast-[0.95] bg-[#fbf0d9]';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 animate-in fade-in duration-150">
      
      {/* Top Header Toolbar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between">
        
        {/* Back and Title */}
        <div className="flex items-center space-x-3 overflow-hidden">
          <button
            onClick={onBack}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="truncate">
            <h2 className="text-xs sm:text-sm font-semibold text-slate-100 truncate max-w-xs sm:max-w-md lg:max-w-lg">
              {paper.title}
            </h2>
            <p className="text-[11px] text-slate-400 font-mono truncate hidden sm:block">
              {paper.authors.join(", ")} • {paper.publicationYear} • {paper.venue}
            </p>
          </div>
        </div>

        {/* Reader Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          
          {/* Reader Theme Toggle */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setReaderTheme('dark')}
              title="Night Dark Mode"
              className={`p-1.5 rounded-md transition ${readerTheme === 'dark' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setReaderTheme('sepia')}
              title="Sepia Eye-Care Mode"
              className={`p-1.5 rounded-md transition ${readerTheme === 'sepia' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setReaderTheme('normal')}
              title="Standard Light Mode"
              className={`p-1.5 rounded-md transition ${readerTheme === 'normal' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle AI Summary Drawer */}
          {summary && (
            <button
              onClick={() => setShowSummaryDrawer(!showSummaryDrawer)}
              title="Toggle AI Sidekick Summary"
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                showSummaryDrawer 
                  ? 'bg-sky-500/20 border-sky-500/40 text-sky-300' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">AI Notes</span>
            </button>
          )}

          {/* Bookmark */}
          <button
            onClick={() => onBookmark(paper)}
            className={`p-1.5 rounded-lg border transition ${
              isBookmarked 
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-400' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Open External */}
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 transition"
              title="Open direct PDF URL in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

        </div>
      </header>

      {/* Main Split Body: PDF View + AI Notes Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* PDF Frame */}
        <div className="flex-1 h-full w-full bg-slate-950 relative flex items-center justify-center overflow-hidden">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title={paper.title}
              className={`w-full h-full border-none transition-all duration-300 ${getViewerStyle()}`}
            />
          ) : (
            <div className="text-center p-8 max-w-md">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-200 mb-1">Direct PDF Preview Blocked</h3>
              <p className="text-xs text-slate-400 mb-4">
                Some publisher domains enforce strict frame blocking. You can still open the paper directly or read the synthesized AI summary.
              </p>
              {paper.landingPageUrl && (
                <a
                  href={paper.landingPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium shadow-md transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open via Publisher Portal</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* AI Summary Side Drawer */}
        {summary && showSummaryDrawer && (
          <aside className="w-full sm:w-80 md:w-96 border-l border-slate-800 bg-slate-900/95 backdrop-blur-md flex flex-col h-full z-20 overflow-y-auto p-4 space-y-4 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs uppercase font-mono font-bold text-sky-400">
                  AI Reading Assistant
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                {summary.mode}
              </span>
            </div>

            {/* TL;DR */}
            <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/40 text-xs">
              <h4 className="font-semibold text-sky-300 mb-1.5 font-mono text-[11px]">💡 Quick Takeaway</h4>
              <ul className="space-y-1 text-slate-300">
                {summary.tldr.map((bullet, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-sky-400">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Core Objective */}
            <div className="text-xs space-y-1">
              <h4 className="font-mono font-semibold text-slate-400 uppercase text-[10px]">🎯 Core Problem</h4>
              <p className="text-slate-300 leading-relaxed">{summary.coreThesis}</p>
            </div>

            {/* Methodology */}
            <div className="text-xs space-y-1">
              <h4 className="font-mono font-semibold text-slate-400 uppercase text-[10px]">🔬 Technical Method</h4>
              <p className="text-slate-300 leading-relaxed">{summary.methodology}</p>
            </div>

            {/* Key Findings */}
            <div className="text-xs space-y-1">
              <h4 className="font-mono font-semibold text-emerald-400 uppercase text-[10px]">📊 Breakthrough Results</h4>
              <p className="text-slate-300 leading-relaxed">{summary.keyFindings}</p>
            </div>

            {/* Limitations */}
            <div className="text-xs space-y-1">
              <h4 className="font-mono font-semibold text-amber-400 uppercase text-[10px]">⚠️ Known Limitations</h4>
              <p className="text-slate-400 leading-relaxed">{summary.limitations}</p>
            </div>
          </aside>
        )}

      </div>
    </div>
  );
};
