import React, { useState, useEffect } from 'react';
import type { Paper, AISummary, UserProfile } from './types';
import { subscribeToAuth, saveUserSession } from './services/firebase';
import { getPaperSummary } from './services/aiSummarizer';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PaperDetailsPanel } from './components/PaperDetailsPanel';
import { SearchHarvest } from './components/SearchHarvest';
import { Bookshelf } from './components/Bookshelf';
import { InAppReader } from './components/InAppReader';
import { AISummaryModal } from './components/AISummaryModal';
import { OfflineApkBanner } from './components/OfflineApkBanner';
import { GoogleSignInModal } from './components/GoogleSignInModal';

export const FEATURED_PAPERS: Paper[] = [
  {
    id: "nature-metabolism-2025-purine",
    doi: "10.1038/s42255-025-01410-x",
    title: "Pathway coessentiality mapping reveals complex II is required for de novo purine biosynthesis in acute myeloid leukaemia",
    publicationYear: 2025,
    citedByCount: 42,
    authors: [
      "Stewart, Amy E.",
      "Zachman, Derek K.",
      "Castellano-Escuder, Pol",
      "Kelly, Lois M.",
      "Zolyomi, Ben",
      "Aiduk, Michael D. I.",
      "Delaney, Christopher D.",
      "Lock, Ian C.",
      "Bosc, Claudie",
      "Bradley, John",
      "Killarney, Shane T.",
      "Stuart, J. Darren",
      "Grimsrud, Paul A.",
      "Ilkayeva, Olga R.",
      "Newgard, Christopher B.",
      "Chandel, Navdeep S.",
      "Puissant, Alexandre",
      "Wood, Kris C.",
      "Hirschey, Matthew D."
    ],
    venue: "Nature Metabolism",
    volume: "7",
    issue: "12",
    pages: "2474-2485",
    type: "article",
    landingPageUrl: "https://doi.org/10.1038/s42255-025-01410-x",
    pdfUrl: "https://www.nature.com/articles/s42255-025-01410-x.pdf",
    abstract: "Understanding how cellular pathways interact is crucial for treating complex diseases like cancer. Individual gene–gene interaction studies have provided valuable insights, but may miss pathways working together. Here we develop a multi-gene approach to pathway mapping which reveals that acute myeloid leukaemia (AML) depends on an unexpected link between complex II and purine metabolism. Through stable-isotope metabolomic tracing, we show that complex II directly supports de novo purine biosynthesis and that exogenous purines rescue AML cells from complex II inhibition. The mechanism involves a metabolic circuit where glutamine provides nitrogen to build the purine ring, producing glutamate that complex II metabolizes to sustain purine synthesis. This connection translates into a metabolic vulnerability whereby increasing intracellular glutamate levels suppresses purine production and sensitizes AML cells to complex II inhibition. In a syngeneic AML mouse model, targeting complex II leads to rapid disease regression and extends survival.",
  },
  {
    id: "aerospace-landing-gear-dt",
    doi: "10.1016/j.paeros.2024.100982",
    title: "Physics-Informed Digital Twin Architecture for Aircraft Landing Gear Structural Health Monitoring",
    publicationYear: 2024,
    citedByCount: 38,
    authors: ["Bello, S. M.", "Adegoke, O.", "Chen, W."],
    venue: "Progress in Aerospace Sciences",
    volume: "148",
    issue: "4",
    pages: "100982",
    type: "journal-article",
    abstract: "Physics-informed neural networks coupled with multi-body dynamics models for aircraft landing gear shock strut fatigue and thermal degradation prediction under high-velocity touchdown loads.",
  }
];

export const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('Library');
  const [activeFolder, setActiveFolder] = useState<string>('Unlinked Papers');
  const [targetDirHandle, setTargetDirHandle] = useState<any>(null);
  const [savedPapers, setSavedPapers] = useState<Paper[]>([]);
  
  // Responsive sidebar & details states matching screenshot workspace
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(window.innerWidth >= 1024);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(window.innerWidth >= 1200);

  // Selected paper in the workspace (defaults to Nature Metabolism reference from screenshot)
  const [selectedPaper, setSelectedPaper] = useState<Paper>(FEATURED_PAPERS[0]);
  const [selectedSummary, setSelectedSummary] = useState<AISummary | null>(null);

  // In-App Reader view state (defaults to true for relaxed reading workspace)
  const [isReadingMode, setIsReadingMode] = useState<boolean>(true);

  // Pre-Read / ARC Summary Modal state
  const [summaryPaper, setSummaryPaper] = useState<Paper | null>(null);
  const [modalSummary, setModalSummary] = useState<AISummary | null>(null);

  // Harvested papers store
  const [harvestedPapers, setHarvestedPapers] = useState<Paper[]>([]);

  // Load saved shelf from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theschola_shelf") || localStorage.getItem("paperpulse_shelf");
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedPapers(parsed);
      }
    } catch {}
  }, []);

  // Subscribe to Firebase Auth / Local session
  useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // Update selected summary when selected paper changes
  useEffect(() => {
    if (selectedPaper) {
      getPaperSummary(selectedPaper).then(res => setSelectedSummary(res));
    }
  }, [selectedPaper]);

  // Save shelf updates to localStorage
  const updateSavedPapers = (papers: Paper[]) => {
    setSavedPapers(papers);
    try {
      localStorage.setItem("theschola_shelf", JSON.stringify(papers));
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

  // Open Full In-App Reader
  const handleReadPaper = (paper: Paper) => {
    setSelectedPaper(paper);
    setIsReadingMode(true);
  };

  // Open ARC Summary Modal
  const handleOpenSummary = async (paper: Paper) => {
    setSummaryPaper(paper);
    setModalSummary(null);
    const sum = await getPaperSummary(paper);
    setModalSummary(sum);
  };

  // Handle Account Selection from Google Sign-In Modal
  const handleSelectAccount = (selectedUser: UserProfile) => {
    setUser(selectedUser);
    saveUserSession(selectedUser);
  };

  // Select Laptop Target Folder (File System Access API)
  const handleSelectTargetDir = async () => {
    if (window.showDirectoryPicker) {
      try {
        const handle = await window.showDirectoryPicker({
          id: "theschola_research_dir",
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

  // Open Any Local Document (.pdf, .docx, .md, .txt)
  const handleOpenFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'doc';
    const tempPaper: Paper = {
      id: `local-${Date.now()}`,
      doi: '',
      title: file.name,
      publicationYear: new Date().getFullYear(),
      citedByCount: 0,
      authors: [user?.displayName || 'Local Researcher'],
      venue: ext.toUpperCase() + ' Document',
      type: ext,
      pdfUrl: ext === 'pdf' ? URL.createObjectURL(file) : undefined,
      abstract: `Local ${ext.toUpperCase()} document: ${file.name} (${Math.round(file.size / 1024)} KB). Available for relaxed reading and ARC AI synthesis.`,
    };
    setSelectedPaper(tempPaper);
    setIsReadingMode(true);
  };

  const bookmarkedIds = new Set(savedPapers.map(p => p.id));

  return (
    <div className="min-h-screen bg-schola-bg text-schola-text flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Global Ambient Watermark of THE SCHOLA */}
      <div 
        className="fixed inset-0 bg-no-repeat bg-center bg-contain opacity-[0.024] pointer-events-none z-0"
        style={{ backgroundImage: `url('/logo.png')` }}
      />

      {/* Top Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'Shelf') {
            setActiveFolder('My Saved Shelf');
            setIsReadingMode(false);
          } else if (tab === 'Harvest') {
            setActiveFolder('Unlinked Papers');
            setIsReadingMode(false);
          } else if (tab === 'Library') {
            setIsReadingMode(true);
            if (window.innerWidth >= 1200) setIsDetailsOpen(true);
          }
        }}
        onOpenGoogleSignIn={() => setIsGoogleModalOpen(true)}
        onOpenArcAI={() => {
          if (selectedPaper) handleOpenSummary(selectedPaper);
          else if (savedPapers[0]) handleOpenSummary(savedPapers[0]);
        }}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        savedCount={savedPapers.length}
      />

      {/* Main Spacious & Responsive Research Workspace */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Left Column: Folders & Collections Sidebar */}
        <Sidebar
          activeFolder={activeFolder}
          onSelectFolder={(folder) => {
            setActiveFolder(folder);
            setIsReadingMode(false);
          }}
          targetDirHandle={targetDirHandle}
          onSelectTargetDir={handleSelectTargetDir}
          savedPapers={savedPapers}
          harvestedPapers={harvestedPapers}
          isOpen={isSidebarOpen}
          onCloseMobile={() => {
            if (window.innerWidth < 768) setIsSidebarOpen(false);
          }}
        />

        {/* Center Column: Relaxed & Stretching Document Workspace */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-schola-bg relative transition-all duration-300">
          
          {isReadingMode && selectedPaper ? (
            <InAppReader
              paper={selectedPaper}
              onBack={() => setIsReadingMode(false)}
              onBookmark={() => handleToggleBookmark(selectedPaper)}
              isBookmarked={bookmarkedIds.has(selectedPaper.id)}
              onOpenSummaryModal={() => handleOpenSummary(selectedPaper)}
            />
          ) : (
            <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-10 space-y-8">
              
              {activeFolder === 'My Saved Shelf' || activeTab === 'Shelf' ? (
                <Bookshelf
                  savedPapers={savedPapers}
                  onOpenSummary={handleOpenSummary}
                  onReadPaper={handleReadPaper}
                  onRemoveBookmark={handleToggleBookmark}
                  onSelectPaper={(p) => {
                    setSelectedPaper(p);
                    setIsDetailsOpen(true);
                  }}
                  selectedPaperId={selectedPaper?.id}
                  onExplore={() => {
                    setActiveFolder('Unlinked Papers');
                    setActiveTab('Library');
                  }}
                />
              ) : (
                <SearchHarvest
                  onOpenSummary={handleOpenSummary}
                  onReadPaper={handleReadPaper}
                  onToggleBookmark={handleToggleBookmark}
                  onSelectPaper={(p) => {
                    setSelectedPaper(p);
                    setIsDetailsOpen(true);
                  }}
                  onHarvested={(p) => setHarvestedPapers(p)}
                  onOpenFile={handleOpenFile}
                  selectedPaperId={selectedPaper?.id}
                  bookmarkedIds={bookmarkedIds}
                  targetDirHandle={targetDirHandle}
                  onSelectTargetDir={handleSelectTargetDir}
                />
              )}

              {/* Sweet Section: Offline Mobile APK Banner */}
              <div className="pt-4">
                <OfflineApkBanner />
              </div>

            </div>
          )}

        </main>

        {/* Right Column: Paper Details & ARC Actions */}
        <PaperDetailsPanel
          paper={selectedPaper}
          summary={selectedSummary}
          onOpenSummaryModal={() => selectedPaper && handleOpenSummary(selectedPaper)}
          onReadPaper={() => selectedPaper && handleReadPaper(selectedPaper)}
          onBookmark={() => selectedPaper && handleToggleBookmark(selectedPaper)}
          onClose={() => setIsDetailsOpen(false)}
          isBookmarked={selectedPaper ? bookmarkedIds.has(selectedPaper.id) : false}
          isOpen={isDetailsOpen}
        />

      </div>

      {/* Pre-Read / ARC Summary Modal */}
      {summaryPaper && (
        <AISummaryModal
          paper={summaryPaper}
          summary={modalSummary}
          onClose={() => setSummaryPaper(null)}
          onReadPaper={handleReadPaper}
          onUpdateSummary={(newSummary) => setModalSummary(newSummary)}
        />
      )}

      {/* Google Sign-In Native Account Picker Modal */}
      <GoogleSignInModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleSelectAccount}
      />

    </div>
  );
};

export default App;
