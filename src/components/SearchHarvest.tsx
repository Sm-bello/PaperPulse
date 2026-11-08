import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  FolderCheck, 
  FolderPlus, 
  FileSpreadsheet, 
  Archive, 
  Layers, 
  Filter
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

  // Search OpenAlex
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setHarvestProgress(null);
    try {
      const { papers: results } = await searchOpenAlex(topic.trim(), fromYear, peerOnly, 1, targetCount);
      setPapers(results);

      // Trigger celebrate confetti on successful search
      if (results.length > 0) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#38bdf8', '#818cf8', '#34d399']
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Harvest directly to folder if handle exists, else download ZIP
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

  // Download all as ZIP
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

  // Export CSV
  const handleExportCsv = () => {
    if (papers.length === 0) return;
    const csv = generatePaperListCsv(papers);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PaperPulse_${topic.slice(0, 30)}_List.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto pt-4 pb-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800/60 text-sky-300 text-xs font-mono mb-4">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Autonomous Literature Discovery & Pre-Read AI</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
          Harvest Research, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Read & Summarize</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Search millions of open-access papers across IEEE, Elsevier, Springer, and arXiv. Download directly to your laptop or phone, read in-app, and synthesize insights before reading.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-4xl mx-auto rounded-3xl bg-slate-900/90 border border-slate-800 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSearch} className="space-y-4">
          
          {/* Main Query Input */}
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter research topic, e.g. 'spiking neural network aerospace flight control'..."
              className="w-full pl-12 pr-32 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm sm:text-base transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-sky-500/25 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Quick Preset Research Pillars */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-slate-500 font-mono flex items-center space-x-1 mr-1">
              <Filter className="w-3 h-3" />
              <span>Pillars:</span>
            </span>
            {PRESET_PILLARS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTopic(p.query);
                  // auto-trigger search for preset
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition font-medium cursor-pointer ${
                  topic === p.query 
                    ? 'bg-sky-500/20 border-sky-500/60 text-sky-300' 
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Controls: Earliest Year, Count, Peer-Only, Storage routing */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              
              {/* Year */}
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400">Year from:</span>
                <select
                  value={fromYear}
                  onChange={(e) => setFromYear(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value={2026}>2026 (Latest)</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                  <option value={2023}>2023</option>
                  <option value={2020}>2020</option>
                  <option value={2015}>2015</option>
                </select>
              </div>

              {/* Count */}
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400">Limit:</span>
                <select
                  value={targetCount}
                  onChange={(e) => setTargetCount(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value={10}>10 papers</option>
                  <option value={25}>25 papers</option>
                  <option value={50}>50 papers</option>
                  <option value={100}>100 papers</option>
                </select>
              </div>

              {/* Peer-Reviewed Only */}
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={peerOnly}
                  onChange={(e) => setPeerOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500 focus:ring-offset-0"
                />
                <span className="text-slate-300">Peer-reviewed only (skip preprints)</span>
              </label>

            </div>

            {/* Storage Target Info */}
            <div className="text-slate-400 flex items-center space-x-1.5">
              {targetDirHandle ? (
                <span className="text-emerald-400 flex items-center space-x-1 font-mono text-[11px]">
                  <FolderCheck className="w-3.5 h-3.5" />
                  <span>Saves to: {targetDirHandle.name}</span>
                </span>
              ) : (
                <span className="text-slate-500 flex items-center space-x-1 font-mono text-[11px]">
                  <span>Device Downloads / ZIP mode</span>
                </span>
              )}
            </div>

          </div>

        </form>
      </div>

      {/* Progress Bar (if harvesting/downloading) */}
      {harvestProgress && (
        <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-sky-950/40 border border-sky-800/60 animate-in fade-in">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-sky-300">
              Downloading ({harvestProgress.current}/{harvestProgress.total})...
            </span>
            <span className="font-mono text-slate-400 truncate max-w-xs">
              {harvestProgress.title}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-sky-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(harvestProgress.current / harvestProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Results Header & Bulk Actions */}
      {papers.length > 0 && (
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 pt-2">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-sky-400" />
              <span>Discovered Papers ({papers.length})</span>
            </h2>
            <p className="text-xs text-slate-400">
              Filtered for legal open-access PDFs matching "{topic}"
            </p>
          </div>

          <div className="flex items-center space-x-2">
            
            {/* Download Folder / ZIP */}
            <button
              onClick={handleHarvestToFolderOrZip}
              disabled={loading || downloadingZip}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md shadow-sky-500/20 transition cursor-pointer"
            >
              {targetDirHandle ? <FolderPlus className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
              <span>{targetDirHandle ? 'Save All to Folder' : 'Download All as ZIP'}</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
              title="Export Paper List.csv for reference managers"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

          </div>
        </div>
      )}

      {/* Papers Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {papers.map((paper, idx) => (
          <PaperCard
            key={paper.id}
            paper={paper}
            index={idx + 1}
            onOpenSummary={onOpenSummary}
            onReadPaper={onReadPaper}
            onToggleBookmark={onToggleBookmark}
            isBookmarked={bookmarkedIds.has(paper.id)}
          />
        ))}
      </div>

    </div>
  );
};
