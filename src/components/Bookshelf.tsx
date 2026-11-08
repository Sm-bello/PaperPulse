import React, { useState } from 'react';
import { 
  Bookmark, 
  FileSpreadsheet, 
  Sparkles, 
  ArrowRight
} from 'lucide-react';
import type { Paper } from '../types';
import { PaperCard } from './PaperCard';
import { generatePaperListCsv } from '../services/downloader';

interface BookshelfProps {
  savedPapers: Paper[];
  onOpenSummary: (paper: Paper) => void;
  onReadPaper: (paper: Paper) => void;
  onRemoveBookmark: (paper: Paper) => void;
  onExplore: () => void;
}

export const Bookshelf: React.FC<BookshelfProps> = ({
  savedPapers,
  onOpenSummary,
  onReadPaper,
  onRemoveBookmark,
  onExplore,
}) => {
  const [filter, setFilter] = useState<'all' | 'has_summary'>('all');

  const filteredPapers = savedPapers.filter(paper => {
    if (filter === 'has_summary') {
      return !!localStorage.getItem(`summary_${paper.id}`);
    }
    return true;
  });

  const handleExportCsv = () => {
    if (savedPapers.length === 0) return;
    const csv = generatePaperListCsv(savedPapers);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PaperPulse_Saved_Shelf.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pt-4 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2.5">
            <Bookmark className="w-6 h-6 text-sky-400" />
            <span>My Research Shelf</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personal archive of bookmarked papers, offline reading lists, and AI digests.
          </p>
        </div>

        {savedPapers.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Shelf CSV</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      {savedPapers.length > 0 && (
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              filter === 'all' 
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 font-medium' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Bookmarks ({savedPapers.length})
          </button>
          <button
            onClick={() => setFilter('has_summary')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border transition ${
              filter === 'has_summary' 
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 font-medium' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>AI Summarized</span>
          </button>
        </div>
      )}

      {/* Papers Grid or Empty State */}
      {filteredPapers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPapers.map((paper, idx) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              index={idx + 1}
              onOpenSummary={onOpenSummary}
              onReadPaper={onReadPaper}
              onToggleBookmark={onRemoveBookmark}
              isBookmarked={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/50 border border-slate-800/80">
          <div className="w-12 h-12 rounded-2xl bg-sky-950/60 text-sky-400 flex items-center justify-center mx-auto mb-3 border border-sky-800/50">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-200 mb-1">Your Shelf is Empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
            Explore and bookmark aerospace and AI literature during your research harvests to build your offline library.
          </p>
          <button
            onClick={onExplore}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
          >
            <span>Explore Research Pillars</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
