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
  onSelectPaper?: (paper: Paper) => void;
  isSelected?: boolean;
  isBookmarked: boolean;
  cachedSummary?: AISummary;
}

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  index,
  onOpenSummary,
  onReadPaper,
  onToggleBookmark,
  onSelectPaper,
  isSelected,
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
    <div 
      onClick={() => onSelectPaper?.(paper)}
      className={`group relative rounded-xl bg-white border p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between cursor-pointer ${
        isSelected 
          ? 'border-schola-arc ring-1 ring-schola-arc/40 shadow-md bg-schola-subtle/30' 
          : 'border-schola-border hover:border-schola-borderDark hover:shadow-xs'
      }`}
    >
      
      {/* Top Meta Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-mono px-2 py-0.5 rounded bg-schola-panel text-schola-text font-semibold text-[11px] border border-schola-border">
              #{String(index).padStart(2, "0")}
            </span>
            <span className="font-mono px-2 py-0.5 rounded bg-schola-arcLight text-schola-arc font-semibold text-[11px] border border-schola-arc/20">
              {paper.publicationYear}
            </span>
            {paper.citedByCount > 0 && (
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-mono">
                <Award className="w-3 h-3 text-amber-600" />
                <span>{paper.citedByCount} citations</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {cachedSummary && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                ARC Cached
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(paper);
              }}
              title={isBookmarked ? "Remove from shelf" : "Save to shelf"}
              className={`p-1.5 rounded-lg border transition ${
                isBookmarked 
                  ? 'border-schola-arc bg-schola-arcLight text-schola-arc' 
                  : 'border-schola-border bg-schola-panel text-schola-muted hover:text-schola-text'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Paper Title (Serif Editorial) */}
        <h3 
          onClick={() => onReadPaper(paper)}
          className="font-serif text-base sm:text-lg font-bold text-schola-text hover:text-schola-arc cursor-pointer leading-snug line-clamp-2 transition mb-1.5"
        >
          {paper.title}
        </h3>

        {/* Authors & Venue */}
        <p className="text-xs text-schola-muted mb-2 line-clamp-1 font-sans">
          {paper.authors.join(", ")}
        </p>
        <p className="text-[11px] text-schola-accent font-mono font-medium truncate mb-3">
          🏛️ {paper.venue}
        </p>

        {/* Abstract Box */}
        {paper.abstract && (
          <div className="mb-4">
            <p className={`text-xs text-schola-text/80 leading-relaxed font-sans ${expanded ? '' : 'line-clamp-2'}`}>
              {paper.abstract}
            </p>
            {paper.abstract.length > 150 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                className="mt-1 text-[11px] text-schola-arc hover:underline font-medium flex items-center space-x-1 cursor-pointer"
              >
                <span>{expanded ? 'Show less' : 'Read abstract preview'}</span>
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-schola-border flex items-center justify-between gap-2">
        
        {/* ARC AI Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenSummary(paper);
          }}
          className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-schola-arcLight hover:bg-schola-arc/15 border border-schola-arc/30 text-schola-arc text-xs font-semibold transition cursor-pointer shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>ARC Summary</span>
        </button>

        {/* Read */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReadPaper(paper);
          }}
          className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-schola-subtle hover:bg-schola-border text-schola-text text-xs font-medium transition cursor-pointer border border-schola-border"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Read</span>
        </button>

        {/* Download PDF */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer border ${
            downloadSuccess 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
              : 'bg-white hover:bg-schola-subtle border-schola-border text-schola-text'
          }`}
          title="Download PDF to phone/laptop"
        >
          {downloadSuccess ? (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
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
