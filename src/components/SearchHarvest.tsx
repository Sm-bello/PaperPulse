import React, { useState } from 'react';
import { 
  Search, 
  FolderCheck, 
  FolderPlus, 
  FileSpreadsheet, 
  Archive, 
  Layers, 
  Filter,
  Upload
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Paper } from '../types';
import { searchOpenAlex } from '../services/openalex';
import { 
  saveToDirectoryHandle, 
  downloadBulkAsZip, 
  generatePaperListCsv 
} from '../services/downloader';
import { PaperCard } from './PaperCard';

interface SearchHarvestProps {
  onOpenSummary: (paper: Paper) => void;
  onReadPaper: (paper: Paper) => void;
  onToggleBookmark: (paper: Paper) => void;
  onSelectPaper?: (paper: Paper) => void;
  onHarvested?: (papers: Paper[]) => void;
  onOpenFile?: (file: File) => void;
  selectedPaperId?: string;
  bookmarkedIds: Set<string>;
  targetDirHandle: any;
  onSelectTargetDir?: () => void;
}

const PRESET_PILLARS = [
  { label: "🛩️ Landing Gear Digital Twin", query: "physics-informed digital twin aircraft landing gear" },
  { label: "⚡ Neuromorphic SNN PHM", query: "spiking neural network aerospace fault diagnosis" },
  { label: "🔥 Rotating Detonation Engine", query: "rotating detonation engine machine learning surrogate" },
  { label: "🔒 Avionics Blockchain & ADS-B", query: "blockchain ADS-B physical plausibility spoofing detection" },
  { label: "🛸 Decentralized UAV Swarms", query: "decentralized digital twin UAV swarm edge" },
];

export const SearchHarvest: React.FC<SearchHarvestProps> = ({
  onOpenSummary,
  onReadPaper,
  onToggleBookmark,
  onSelectPaper,
  onHarvested,
  onOpenFile,
  selectedPaperId,
  bookmarkedIds,
  targetDirHandle,
}) => {
  const [topic, setTopic] = useState("physics-informed digital twin aircraft landing gear");
  const [fromYear, setFromYear] = useState<number>(2024);
  const [targetCount, setTargetCount] = useState<number>(25);
  const [peerOnly, setPeerOnly] = useState<boolean>(true);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloadingZip, setDownloadingZip] = useState<boolean>(false);
  const [harvestProgress, setHarvestProgress] = useState<{ current: number; total: number; title: string } | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setHarvestProgress(null);
    try {
      const { papers: results } = await searchOpenAlex(topic.trim(), fromYear, peerOnly, 1, targetCount);
      setPapers(results);
      onHarvested?.(results);
      if (results.length > 0 && onSelectPaper) {
        onSelectPaper(results[0]);
      }

      if (results.length > 0) {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#3d5a49', '#8f6b48', '#22201d']
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleHarvestToFolderOrZip = async () => {
    if (papers.length === 0) return;

    if (targetDirHandle) {
      setLoading(true);
      try {
        const count = await saveToDirectoryHandle(
          targetDirHandle,
          topic,
          papers,
          (cur, tot, name) => setHarvestProgress({ current: cur, total: tot, title: name })
        );
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
        alert(`Successfully saved ${count} papers and Paper List.csv directly into folder "${targetDirHandle.name}/${topic}"!`);
      } catch (err: any) {
        console.error("Folder save failed, falling back to ZIP:", err);
        handleDownloadZip();
      } finally {
        setLoading(false);
        setHarvestProgress(null);
      }
    } else {
      handleDownloadZip();
    }
  };

  const handleDownloadZip = async () => {
    if (papers.length === 0) return;
    setDownloadingZip(true);
    try {
      await downloadBulkAsZip(
        topic,
        papers,
        (cur, tot, name) => setHarvestProgress({ current: cur, total: tot, title: name })
      );
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingZip(false);
      setHarvestProgress(null);
    }
  };

  const handleExportCsv = () => {
    if (papers.length === 0) return;
    const csv = generatePaperListCsv(papers);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `THE_SCHOLA_${topic.slice(0, 30)}_List.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Search Input Box */}
      <div className="rounded-2xl bg-white border border-schola-border p-4 sm:p-5 shadow-xs">
        <form onSubmit={handleSearch} className="space-y-3">
          
          {/* Main Query Input */}
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-schola-muted" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Search research topic (e.g. 'spiking neural network aerospace flight control')..."
              className="w-full pl-10 pr-28 py-2.5 rounded-xl bg-schola-bg border border-schola-border text-schola-text placeholder-schola-muted/70 focus:outline-none focus:ring-1 focus:ring-schola-arc text-xs sm:text-sm font-sans"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-1.5 px-4 py-1.5 rounded-lg bg-schola-arc hover:bg-schola-arcHover text-white text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Quick Preset Research Pillars */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-schola-muted font-mono flex items-center space-x-1 mr-1">
              <Filter className="w-3 h-3" />
              <span>Pillars:</span>
            </span>
            {PRESET_PILLARS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTopic(p.query)}
                className={`text-[11px] px-2.5 py-1 rounded-md border transition font-medium cursor-pointer ${
                  topic === p.query 
                    ? 'bg-schola-arcLight border-schola-arc/30 text-schola-arc' 
                    : 'bg-schola-panel border-schola-border text-schola-muted hover:text-schola-text'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Filters Row */}
          <div className="pt-2 border-t border-schola-border flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              
              <div className="flex items-center space-x-1.5 text-schola-muted">
                <span>From year:</span>
                <select
                  value={fromYear}
                  onChange={(e) => setFromYear(Number(e.target.value))}
                  className="bg-white border border-schola-border rounded-md px-2 py-0.5 text-schola-text focus:outline-none focus:ring-1 focus:ring-schola-arc"
                >
                  <option value={2026}>2026 (Latest)</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                  <option value={2023}>2023</option>
                  <option value={2020}>2020</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5 text-schola-muted">
                <span>Limit:</span>
                <select
                  value={targetCount}
                  onChange={(e) => setTargetCount(Number(e.target.value))}
                  className="bg-white border border-schola-border rounded-md px-2 py-0.5 text-schola-text focus:outline-none focus:ring-1 focus:ring-schola-arc"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <label className="flex items-center space-x-1.5 text-schola-text cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={peerOnly}
                  onChange={(e) => setPeerOnly(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-schola-border text-schola-arc focus:ring-schola-arc"
                />
                <span>Peer-reviewed only</span>
              </label>

            </div>

            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-1.5 px-3 py-1 rounded-md border border-schola-border bg-schola-panel hover:bg-schola-subtle text-schola-text text-xs font-medium cursor-pointer transition">
                <Upload className="w-3.5 h-3.5 text-schola-arc" />
                <span className="hidden sm:inline">Open Document (.pdf, .docx, .md, .txt)</span>
                <span className="sm:hidden">Open File</span>
                <input
                  type="file"
                  accept=".pdf,.md,.markdown,.docx,.txt,.csv,.json,.py,.tex,.bib"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && onOpenFile) onOpenFile(f);
                  }}
                />
              </label>

              <div className="text-[11px] font-mono text-schola-muted flex items-center space-x-1">
                {targetDirHandle ? (
                  <span className="text-emerald-700 flex items-center space-x-1">
                    <FolderCheck className="w-3 h-3" />
                    <span>Linked: {targetDirHandle.name}</span>
                  </span>
                ) : (
                  <span>Downloads / Mobile ZIP</span>
                )}
              </div>
            </div>

          </div>

        </form>
      </div>

      {/* Progress Bar */}
      {harvestProgress && (
        <div className="p-3.5 rounded-xl bg-schola-panel border border-schola-border">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-schola-arc">
              Downloading ({harvestProgress.current}/{harvestProgress.total})...
            </span>
            <span className="font-mono text-schola-muted truncate max-w-xs text-[11px]">
              {harvestProgress.title}
            </span>
          </div>
          <div className="w-full bg-schola-subtle rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-schola-arc h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(harvestProgress.current / harvestProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Results Header & Bulk Actions */}
      {papers.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div>
            <h2 className="font-serif text-lg font-bold text-schola-text flex items-center space-x-2">
              <Layers className="w-4 h-4 text-schola-arc" />
              <span>Harvested Papers ({papers.length})</span>
            </h2>
            <p className="text-[11px] text-schola-muted">
              Matching open-access literature from OpenAlex global database
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleHarvestToFolderOrZip}
              disabled={loading || downloadingZip}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-schola-arc hover:bg-schola-arcHover text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              {targetDirHandle ? <FolderPlus className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
              <span>{targetDirHandle ? 'Save All to Folder' : 'Download All as ZIP'}</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-schola-subtle border border-schola-border text-schola-text text-xs font-medium transition cursor-pointer"
              title="Export Paper List.csv"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-schola-muted" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Papers Grid */}
      <div className="grid grid-cols-1 gap-3.5">
        {papers.map((paper, idx) => (
          <PaperCard
            key={paper.id}
            paper={paper}
            index={idx + 1}
            onOpenSummary={onOpenSummary}
            onReadPaper={onReadPaper}
            onToggleBookmark={onToggleBookmark}
            onSelectPaper={onSelectPaper}
            isSelected={selectedPaperId === paper.id}
            isBookmarked={bookmarkedIds.has(paper.id)}
          />
        ))}
      </div>

    </div>
  );
};
