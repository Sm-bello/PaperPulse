import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Trash2, 
  HardDrive, 
  Bookmark, 
  CheckCircle2, 
  Search, 
  ArrowRight 
} from 'lucide-react';
import type { Paper, HistoryEntry } from '../types';
import { downloadSinglePaper } from '../services/downloader';

interface DownloadsAndHistoryProps {
  onReadPaper: (paper: Paper) => void;
  onOpenArcAI: (paper: Paper) => void;
  onBookmark: (paper: Paper) => void;
  bookmarkedIds: Set<string>;
  onExplore: () => void;
}

export const DownloadsAndHistory: React.FC<DownloadsAndHistoryProps> = ({
  onReadPaper,
  onOpenArcAI,
  onBookmark,
  bookmarkedIds,
  onExplore,
}) => {
  const [activeTab, setActiveTab] = useState<'downloads' | 'history'>('downloads');
  const [downloadedPapers, setDownloadedPapers] = useState<Paper[]>([]);
  const [historyList, setHistoryList] = useState<HistoryEntry[]>([]);
  const [filterQuery, setFilterQuery] = useState('');

  const loadData = () => {
    try {
      const rawDl = localStorage.getItem('theschola_downloads');
      if (rawDl) setDownloadedPapers(JSON.parse(rawDl));
      
      const rawHist = localStorage.getItem('theschola_history');
      if (rawHist) setHistoryList(JSON.parse(rawHist));
    } catch (err) {
      console.error('Failed to load downloads/history:', err);
    }
  };

  useEffect(() => {
    loadData();
    const handleStorageUpdate = () => loadData();
    window.addEventListener('scholapulse_storage_updated', handleStorageUpdate);
    return () => window.removeEventListener('scholapulse_storage_updated', handleStorageUpdate);
  }, []);

  const handleRemoveDownload = (paperId: string) => {
    const updated = downloadedPapers.filter(p => p.id !== paperId);
    setDownloadedPapers(updated);
    try {
      localStorage.setItem('theschola_downloads', JSON.stringify(updated));
      window.dispatchEvent(new Event('scholapulse_storage_updated'));
    } catch {}
  };

  const handleClearHistory = () => {
    setHistoryList([]);
    try {
      localStorage.removeItem('theschola_history');
      window.dispatchEvent(new Event('scholapulse_storage_updated'));
    } catch {}
  };

  const filteredDownloads = downloadedPapers.filter(p => 
    p.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    p.authors.some(a => a.toLowerCase().includes(filterQuery.toLowerCase())) ||
    (p.venue && p.venue.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const filteredHistory = historyList.filter(item => 
    item.paper.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    item.paper.authors.some(a => a.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const formatTimestamp = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner & Tab Switcher */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-schola-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-schola-text flex items-center space-x-2">
            <HardDrive className="w-5 h-5 text-schola-arc" />
            <span>Downloads & Reading History</span>
          </h2>
          <p className="text-xs text-schola-muted mt-1">
            Offline PDFs, batch unzipped bundles, and reading logs stored securely on your device.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-schola-panel border border-schola-border self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveTab('downloads')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition font-medium cursor-pointer ${
              activeTab === 'downloads'
                ? 'bg-white shadow-2xs text-schola-text font-bold border border-schola-border'
                : 'text-schola-muted hover:text-schola-text'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-schola-arc" />
            <span>Downloads ({downloadedPapers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition font-medium cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white shadow-2xs text-schola-text font-bold border border-schola-border'
                : 'text-schola-muted hover:text-schola-text'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-schola-arc" />
            <span>History ({historyList.length})</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      {(downloadedPapers.length > 0 || historyList.length > 0) && (
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-schola-muted" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder={`Filter ${activeTab === 'downloads' ? 'downloaded papers' : 'reading history'} by title, author, or venue...`}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-schola-border text-schola-text placeholder-schola-muted/70 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-schola-arc shadow-2xs"
          />
        </div>
      )}

      {/* TAB 1: DOWNLOADED PAPERS (UNZIPPED & ACCESSIBLE) */}
      {activeTab === 'downloads' && (
        <div className="space-y-4">
          {filteredDownloads.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-schola-border p-10 sm:p-14 text-center bg-white/70">
              <Download className="w-12 h-12 text-schola-muted/60 mx-auto mb-3" />
              <h3 className="font-serif text-base font-bold text-schola-text mb-1">
                {filterQuery ? 'No matching downloads found' : 'No Downloaded Papers Yet'}
              </h3>
              <p className="text-xs text-schola-muted max-w-md mx-auto mb-5 leading-relaxed">
                When you download individual PDFs or harvest bundles as ZIPs, all papers are automatically extracted and stored here unzipped for offline reading.
              </p>
              <button
                onClick={onExplore}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-schola-arc text-white text-xs font-semibold hover:bg-schola-arcHover transition cursor-pointer shadow-2xs"
              >
                <span>Discover & Harvest Papers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredDownloads.map((paper, idx) => {
                const isBookmarked = bookmarkedIds.has(paper.id);
                return (
                  <div
                    key={paper.id || idx}
                    className="p-4 sm:p-5 rounded-xl bg-white border border-schola-border shadow-xs hover:border-schola-arc/60 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Offline Ready</span>
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-schola-panel text-schola-muted border border-schola-border uppercase">
                          {paper.type || 'PDF'}
                        </span>
                        <span className="font-mono text-[10px] text-schola-muted">
                          {paper.publicationYear}
                        </span>
                        {paper.downloadedAt && (
                          <span className="text-[10px] text-schola-muted font-mono hidden sm:inline">
                            · Saved {formatTimestamp(paper.downloadedAt)}
                          </span>
                        )}
                      </div>

                      <h4 
                        onClick={() => onReadPaper(paper)}
                        className="font-serif text-sm sm:text-base font-bold text-schola-text hover:text-schola-arc cursor-pointer transition leading-snug line-clamp-2"
                      >
                        {paper.title}
                      </h4>

                      <p className="text-xs text-schola-muted truncate font-sans">
                        {paper.authors.join(', ')} · <span className="font-serif italic">{paper.venue}</span>
                      </p>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center space-x-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-schola-border/60">
                      {/* Read Now */}
                      <button
                        onClick={() => onReadPaper(paper)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-schola-arc hover:bg-schola-arcHover text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                        title="Read paper in in-app reader"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read</span>
                      </button>

                      {/* Ask ARC AI */}
                      <button
                        onClick={() => onOpenArcAI(paper)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#fbf5ea] hover:bg-[#f5ecdc] text-schola-text border border-[#ecd9be] text-xs font-medium transition cursor-pointer shadow-2xs"
                        title="Open interactive ARC AI chat about this paper"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-schola-arc" />
                        <span className="hidden sm:inline">Ask ARC</span>
                      </button>

                      {/* Save to Device again */}
                      <button
                        onClick={() => downloadSinglePaper(paper)}
                        className="p-1.5 rounded-lg border border-schola-border hover:bg-schola-panel text-schola-muted hover:text-schola-text transition cursor-pointer"
                        title="Re-save PDF file to local device folder"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {/* Bookmark / Shelf */}
                      <button
                        onClick={() => onBookmark(paper)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          isBookmarked 
                            ? 'border-schola-arc bg-schola-arcLight text-schola-arc' 
                            : 'border-schola-border hover:bg-schola-panel text-schola-muted hover:text-schola-text'
                        }`}
                        title={isBookmarked ? 'Bookmarked' : 'Add to Shelf'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleRemoveDownload(paper.id)}
                        className="p-1.5 rounded-lg border border-schola-border hover:bg-rose-50 text-schola-muted hover:text-rose-600 transition cursor-pointer"
                        title="Remove from downloaded offline library"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: READING HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-schola-muted px-1">
            <span>Recently opened documents and papers</span>
            {historyList.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-rose-600 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {filteredHistory.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-schola-border p-10 sm:p-14 text-center bg-white/70">
              <Clock className="w-12 h-12 text-schola-muted/60 mx-auto mb-3" />
              <h3 className="font-serif text-base font-bold text-schola-text mb-1">
                {filterQuery ? 'No matching history entries' : 'No Reading History Recorded'}
              </h3>
              <p className="text-xs text-schola-muted max-w-md mx-auto mb-5 leading-relaxed">
                As you read papers in the reader, your progress and timestamps will automatically be logged here for quick retrieval.
              </p>
              <button
                onClick={onExplore}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-schola-arc text-white text-xs font-semibold hover:bg-schola-arcHover transition cursor-pointer shadow-2xs"
              >
                <span>Start Reading</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-xl bg-white border border-schola-border shadow-xs hover:border-schola-arc/50 transition flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-schola-muted">
                      <Clock className="w-3 h-3 text-schola-arc" />
                      <span>Read {formatTimestamp(item.readAt)}</span>
                      <span>·</span>
                      <span className="uppercase">{item.paper.venue || 'Journal'}</span>
                    </div>

                    <h4 
                      onClick={() => onReadPaper(item.paper)}
                      className="font-serif text-sm font-bold text-schola-text hover:text-schola-arc cursor-pointer transition truncate"
                    >
                      {item.paper.title}
                    </h4>

                    <p className="text-xs text-schola-muted truncate font-sans">
                      {item.paper.authors.join(', ')} ({item.paper.publicationYear})
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => onReadPaper(item.paper)}
                      className="px-3 py-1.5 rounded-lg bg-schola-subtle hover:bg-schola-border text-schola-text text-xs font-medium border border-schola-border transition cursor-pointer flex items-center space-x-1"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-schola-arc" />
                      <span>Resume</span>
                    </button>

                    <button
                      onClick={() => onOpenArcAI(item.paper)}
                      className="p-1.5 rounded-lg border border-schola-border hover:bg-schola-subtle text-schola-muted hover:text-schola-text transition cursor-pointer"
                      title="Ask ARC AI about this paper"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-schola-arc" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
