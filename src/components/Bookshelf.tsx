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
  onSelectPaper?: (paper: Paper) => void;
  selectedPaperId?: string;
  onExplore: () => void;
}

export const Bookshelf: React.FC<BookshelfProps> = ({
  savedPapers,
  onOpenSummary,
  onReadPaper,
  onRemoveBookmark,
  onSelectPaper,
  selectedPaperId,
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
    a.download = `THE_SCHOLA_Saved_Library.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-schola-border pb-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-schola-text flex items-center space-x-2.5">
            <Bookmark className="w-5 h-5 text-schola-arc" />
            <span>My Research Library</span>
          </h1>
          <p className="text-xs text-schola-muted mt-0.5">
            Curated archive of bookmarked literature, offline reading lists, and ARC digests.
          </p>
        </div>

        {savedPapers.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-schola-subtle border border-schola-border text-schola-text text-xs font-medium transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-schola-arc" />
              <span>Export Library CSV</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      {savedPapers.length > 0 && (
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md border transition ${
              filter === 'all' 
                ? 'bg-schola-arcLight border-schola-arc/30 text-schola-arc font-medium' 
                : 'bg-white border-schola-border text-schola-muted hover:text-schola-text'
            }`}
          >
            All Bookmarks ({savedPapers.length})
          </button>
          <button
            onClick={() => setFilter('has_summary')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md border transition ${
              filter === 'has_summary' 
                ? 'bg-schola-arcLight border-schola-arc/30 text-schola-arc font-medium' 
                : 'bg-white border-schola-border text-schola-muted hover:text-schola-text'
            }`}
          >
            <Sparkles className="w-3 h-3 text-schola-arc" />
            <span>ARC Synthesized</span>
          </button>
        </div>
      )}

      {/* Papers Grid or Empty State */}
      {filteredPapers.length > 0 ? (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredPapers.map((paper, idx) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              index={idx + 1}
              onOpenSummary={onOpenSummary}
              onReadPaper={onReadPaper}
              onToggleBookmark={onRemoveBookmark}
              onSelectPaper={onSelectPaper}
              isSelected={selectedPaperId === paper.id}
              isBookmarked={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-2xl bg-white border border-schola-border">
          <div className="w-12 h-12 rounded-xl bg-schola-arcLight text-schola-arc flex items-center justify-center mx-auto mb-3 border border-schola-arc/20">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-base font-bold text-schola-text mb-1">Your Library is Empty</h3>
          <p className="text-xs text-schola-muted max-w-sm mx-auto mb-4">
            Search research pillars or open access indices to add papers to your collection.
          </p>
          <button
            onClick={onExplore}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-schola-arc hover:bg-schola-arcHover text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <span>Explore Literature</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
