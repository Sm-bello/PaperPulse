import React, { useState } from 'react';
import { 
  Bookmark, 
  FileSpreadsheet, 
  Sparkles, 
  ArrowRight,
  BookOpen,
  Search,
  FileText
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
  const [filter, setFilter] = useState<'all' | 'has_summary' | 'pdf_ready'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPapers = savedPapers.filter(paper => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = paper.title.toLowerCase().includes(q) ||
        paper.authors.some(a => a.toLowerCase().includes(q)) ||
        (paper.abstract && paper.abstract.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (filter === 'has_summary') {
      return !!localStorage.getItem(`summary_${paper.id}`);
    }
    if (filter === 'pdf_ready') {
      return !!paper.pdfUrl || !!paper.doi;
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
            <span>My Research Shelf</span>
          </h1>
          <p className="text-xs text-schola-muted mt-0.5">
            Your personal digital library: offline papers, custom folders, and interactive reading center.
          </p>
        </div>

        {savedPapers.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-schola-subtle border border-schola-border text-schola-text text-xs font-medium transition cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-schola-arc" />
              <span>Export CSV</span>
            </button>
          </div>
        )}
      </div>

      {/* Search and Filters Bar */}
      {savedPapers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          
          {/* Quick Search in Shelf */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-schola-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter shelf by title, author, or keyword..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-schola-border bg-white text-xs text-schola-text placeholder-schola-muted focus:outline-none focus:border-schola-arc transition shadow-2xs"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 text-xs overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg border transition cursor-pointer whitespace-nowrap ${
                filter === 'all' 
                  ? 'bg-schola-arc text-white border-schola-arc font-semibold shadow-2xs' 
                  : 'bg-white border-schola-border text-schola-muted hover:text-schola-text'
              }`}
            >
              All Papers ({savedPapers.length})
            </button>
            <button
              onClick={() => setFilter('pdf_ready')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg border transition cursor-pointer whitespace-nowrap ${
                filter === 'pdf_ready' 
                  ? 'bg-schola-arc text-white border-schola-arc font-semibold shadow-2xs' 
                  : 'bg-white border-schola-border text-schola-muted hover:text-schola-text'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Readable PDFs</span>
            </button>
            <button
              onClick={() => setFilter('has_summary')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg border transition cursor-pointer whitespace-nowrap ${
                filter === 'has_summary' 
                  ? 'bg-schola-arc text-white border-schola-arc font-semibold shadow-2xs' 
                  : 'bg-white border-schola-border text-schola-muted hover:text-schola-text'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>ARC Synthesized</span>
            </button>
          </div>

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
      ) : savedPapers.length > 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-white border border-schola-border">
          <p className="text-xs text-schola-muted">No papers match your search "{searchQuery}".</p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-2 text-xs text-schola-arc hover:underline font-medium cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-2xl bg-white border border-schola-border shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-schola-arcLight text-schola-arc flex items-center justify-center mx-auto mb-3 border border-schola-arc/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-base font-bold text-schola-text mb-1">Your Research Shelf is Clean</h3>
          <p className="text-xs text-schola-muted max-w-sm mx-auto mb-4 leading-relaxed">
            Harvest literature or explore your discipline's research pillars to add papers, view unzipped downloads, and read inside THE SCHOLA engine.
          </p>
          <button
            onClick={onExplore}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-schola-arc hover:bg-schola-arcHover text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <span>Explore Research Pillars</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
