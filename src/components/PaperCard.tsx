import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Download, 
  Bookmark, 
  ChevronDown, 
  ChevronUp, 
  Award,
  CheckCircle
} from 'lucide-react';
import type { Paper, AISummary } from '../types';
import { downloadSinglePaper } from '../services/downloader';

interface PaperCardProps {
  paper: Paper;
  index: number;
  onOpenSummary: (paper: Paper) => void;
  onReadPaper: (paper: Paper) => void;
  onToggleBookmark: (paper: Paper) => void;
  isBookmarked: boolean;
  cachedSummary?: AISummary;
}

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  index,
  onOpenSummary,
  onReadPaper,
  onToggleBookmark,
  isBookmarked,
  cachedSummary,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(true);
    const success = await downloadSinglePaper(paper, index);
    setDownloading(false);
    if (success) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    }
  };

  return (
    <div className="group relative rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-sky-500/50 p-4 sm:p-5 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/5 flex flex-col justify-between">
      
      {/* Top Meta Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-mono px-2 py-0.5 rounded-md bg-slate-800 text-sky-400 font-semibold text-[11px] border border-slate-700/60">
              #{String(index).padStart(2, "0")}
            </span>
            <span className="font-mono px-2 py-0.5 rounded-md bg-sky-950/80 text-sky-300 font-medium text-[11px] border border-sky-800/50">
              {paper.publicationYear}
            </span>
            {paper.citedByCount > 0 && (
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-950/40 text-amber-300 border border-amber-800/40 text-[11px] font-mono">
                <Award className="w-3 h-3 text-amber-400" />
                <span>{paper.citedByCount} citations</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {cachedSummary && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 font-mono">
                AI Cached ({cachedSummary.mode})
              </span>
            )}
            <button
              onClick={() => onToggleBookmark(paper)}
              title={isBookmarked ? "Remove from shelf" : "Save to shelf"}
              className={`p-1.5 rounded-lg border transition ${
                isBookmarked 
                  ? 'border-sky-500/60 bg-sky-500/20 text-sky-400' 
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Paper Title */}
        <h3 
          onClick={() => onReadPaper(paper)}
          className="text-sm sm:text-base font-semibold text-slate-100 hover:text-sky-400 cursor-pointer leading-snug line-clamp-2 transition mb-1.5"
        >
          {paper.title}
        </h3>

        {/* Authors & Venue */}
        <p className="text-xs text-slate-400 mb-2 line-clamp-1">
          {paper.authors.join(", ")}
        </p>
        <p className="text-[11px] text-sky-400/90 font-mono font-medium truncate mb-3">
          🏛️ {paper.venue}
        </p>

        {/* Abstract Box */}
        {paper.abstract && (
          <div className="mb-4">
            <p className={`text-xs text-slate-300 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
              {paper.abstract}
            </p>
            {paper.abstract.length > 150 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-1 text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center space-x-1 cursor-pointer"
              >
                <span>{expanded ? 'Show less' : 'Read abstract preview'}</span>
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        
        {/* Pre-Read AI Summary Trigger */}
        <button
          onClick={() => onOpenSummary(paper)}
          className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-sky-950/70 to-indigo-950/50 hover:from-sky-900/80 hover:to-indigo-900/70 border border-sky-800/50 text-sky-300 hover:text-white text-xs font-medium transition cursor-pointer shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span>Pre-Read AI</span>
        </button>

        {/* In-App Reader */}
        <button
          onClick={() => onReadPaper(paper)}
          className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Read</span>
        </button>

        {/* Download PDF */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer border ${
            downloadSuccess 
              ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300' 
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
          title="Download PDF to phone/laptop"
        >
          {downloadSuccess ? (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {downloadSuccess ? 'Saved' : downloading ? '...' : 'PDF'}
          </span>
        </button>

      </div>
    </div>
  );
};
