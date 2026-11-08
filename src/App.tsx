import React, { useState, useEffect } from 'react';
import type { Paper, AISummary, UserProfile } from './types';
import { subscribeToAuth } from './services/firebase';
import { getPaperSummary } from './services/aiSummarizer';
import { Navbar } from './components/Navbar';
import { SearchHarvest } from './components/SearchHarvest';
import { Bookshelf } from './components/Bookshelf';
import { InAppReader } from './components/InAppReader';
import { AISummaryModal } from './components/AISummaryModal';

export const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'harvest' | 'shelf' | 'reader'>('harvest');
  const [targetDirHandle, setTargetDirHandle] = useState<any>(null);
  const [savedPapers, setSavedPapers] = useState<Paper[]>([]);
  
  // Reader state
  const [readingPaper, setReadingPaper] = useState<Paper | null>(null);
  const [readingSummary, setReadingSummary] = useState<AISummary | null>(null);

  // Summary Modal state
  const [summaryPaper, setSummaryPaper] = useState<Paper | null>(null);
  const [modalSummary, setModalSummary] = useState<AISummary | null>(null);

  // Load saved shelf from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("paperpulse_shelf");
      if (stored) setSavedPapers(JSON.parse(stored));
    } catch {}
  }, []);

  // Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // Save shelf updates to localStorage
  const updateSavedPapers = (papers: Paper[]) => {
    setSavedPapers(papers);
    try {
      localStorage.setItem("paperpulse_shelf", JSON.stringify(papers));
    } catch {}
  };

  // Toggle bookmark on a paper
  const handleToggleBookmark = (paper: Paper) => {
    const exists = savedPapers.some(p => p.id === paper.id);
    if (exists) {
      updateSavedPapers(savedPapers.filter(p => p.id !== paper.id));
    } else {
      updateSavedPapers([paper, ...savedPapers]);
    }
  };

  // Open In-App Reader
  const handleReadPaper = async (paper: Paper) => {
    setReadingPaper(paper);
    // Fetch summary asynchronously for the side drawer
    const sum = await getPaperSummary(paper);
    setReadingSummary(sum);
  };

  // Open Pre-Read AI Summary Modal
  const handleOpenSummary = async (paper: Paper) => {
    setSummaryPaper(paper);
    setModalSummary(null);
    const sum = await getPaperSummary(paper);
    setModalSummary(sum);
  };

  // Select Laptop Target Folder (File System Access API)
  const handleSelectTargetDir = async () => {
    if (window.showDirectoryPicker) {
      try {
        const handle = await window.showDirectoryPicker({
          id: "paperpulse_research_dir",
          mode: "readwrite"
        });
        setTargetDirHandle(handle);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Directory selection error:", err);
        }
      }
    }
  };

  const bookmarkedIds = new Set(savedPapers.map(p => p.id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Navigation Bar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        targetDirHandle={targetDirHandle}
        onSelectTargetDir={handleSelectTargetDir}
        savedCount={savedPapers.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'harvest' && (
          <SearchHarvest
            onOpenSummary={handleOpenSummary}
            onReadPaper={handleReadPaper}
            onToggleBookmark={handleToggleBookmark}
            bookmarkedIds={bookmarkedIds}
            targetDirHandle={targetDirHandle}
            onSelectTargetDir={handleSelectTargetDir}
          />
        )}

        {activeTab === 'shelf' && (
          <Bookshelf
            savedPapers={savedPapers}
            onOpenSummary={handleOpenSummary}
            onReadPaper={handleReadPaper}
            onRemoveBookmark={handleToggleBookmark}
            onExplore={() => setActiveTab('harvest')}
          />
        )}
      </main>

      {/* In-App PDF Reader Modal */}
      {readingPaper && (
        <InAppReader
          paper={readingPaper}
          summary={readingSummary}
          onBack={() => setReadingPaper(null)}
          onBookmark={handleToggleBookmark}
          isBookmarked={bookmarkedIds.has(readingPaper.id)}
        />
      )}

      {/* Pre-Read AI Summary Modal */}
      {summaryPaper && (
        <AISummaryModal
          paper={summaryPaper}
          summary={modalSummary}
          onClose={() => setSummaryPaper(null)}
          onReadPaper={handleReadPaper}
          onUpdateSummary={(newSummary) => setModalSummary(newSummary)}
        />
      )}

      {/* Subtle Aerospace Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 font-mono">
        <p>
          PaperPulse · Smart Open-Access Aviation & AI Literature Hub · Penelope Inc. PHI Lab
        </p>
      </footer>

    </div>
  );
};

export default App;
