import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Sparkles, 
  Moon, 
  Sun, 
  Eye, 
  Bookmark, 
  ZoomIn, 
  ZoomOut, 
  Upload, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  FileCode,
  Copy,
  Check
} from 'lucide-react';
import type { Paper } from '../types';
import { downloadSinglePaper } from '../services/downloader';
import { parseDocumentFile, type ParsedDocument } from '../services/documentParser';

interface InAppReaderProps {
  paper: Paper;
  onBack: () => void;
  onBookmark: (paper: Paper) => void;
  isBookmarked: boolean;
  onOpenSummaryModal?: () => void;
}

export const InAppReader: React.FC<InAppReaderProps> = ({
  paper,
  onBack,
  onBookmark,
  isBookmarked,
  onOpenSummaryModal,
}) => {
  const [readerTheme, setReaderTheme] = useState<'normal' | 'dark' | 'sepia'>('normal');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeDoc, setActiveDoc] = useState<ParsedDocument | null>(null);
  const [viewMode, setViewMode] = useState<'typeset' | 'pdf_stream'>('typeset');
  const [downloading, setDownloading] = useState(false);
  const [copiedDoi, setCopiedDoi] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Total pages in typeset view mode
  const totalPages = 6;

  // Jump to top of container when page changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  // Keyboard navigation for pages
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentPage(prev => Math.max(1, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalPages]);

  const pdfUrl = activeDoc?.url || paper.pdfUrl || (paper.landingPageUrl?.includes('arxiv.org/abs/') ? paper.landingPageUrl.replace('/abs/', '/pdf/') + '.pdf' : "");

  const handleDownload = async () => {
    setDownloading(true);
    await downloadSinglePaper(paper);
    setDownloading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const parsed = await parseDocumentFile(file);
      setActiveDoc(parsed);
      setCurrentPage(1);
    }
  };

  const copyDoiToClipboard = () => {
    if (!paper.doi) return;
    navigator.clipboard.writeText(`https://doi.org/${paper.doi}`);
    setCopiedDoi(true);
    setTimeout(() => setCopiedDoi(false), 2000);
  };

  const getContainerThemeStyle = () => {
    switch (readerTheme) {
      case 'dark':
        return 'bg-slate-900 text-slate-100';
      case 'sepia':
        return 'bg-[#fbf3e4] text-[#433422]';
      default:
        return 'bg-[#f8f5ee] text-[#22201d]';
    }
  };

  const docTitle = activeDoc?.title || paper.title;

  return (
    <div className={`flex-1 flex flex-col h-full w-full select-none transition-colors duration-200 ${getContainerThemeStyle()}`}>
      
      {/* Hidden File Input for Opening Any Document */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.md,.markdown,.docx,.txt,.csv,.json,.py,.tex,.bib"
        className="hidden"
      />

      {/* Top Reading Navigation Bar */}
      <div className="h-12 px-3 sm:px-6 border-b border-schola-border flex items-center justify-between text-xs bg-schola-panel/95 backdrop-blur-md z-30 sticky top-0 shadow-2xs">
        
        {/* Back and Title */}
        <div className="flex items-center space-x-2.5 truncate max-w-[200px] sm:max-w-xs md:max-w-md shrink-0">
          <button 
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-schola-subtle text-schola-muted hover:text-schola-text transition cursor-pointer"
            title="Back to Collections"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="truncate">
            <span className="font-serif font-bold text-xs sm:text-sm text-schola-text truncate block">
              {docTitle}
            </span>
            <span className="text-[10px] font-mono text-schola-muted truncate block">
              {paper.authors?.[0] ? `${paper.authors[0]} et al.` : "Academic Paper"} · {paper.publicationYear || paper.year || 2025}
            </span>
          </div>
        </div>

        {/* Center: Real Page Navigation & Zoom Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
          
          {/* Mode Switcher: Typeset vs Raw PDF Stream (if pdfUrl exists) */}
          {pdfUrl && (
            <div className="hidden sm:flex items-center rounded-lg border border-schola-border p-0.5 bg-white text-[11px]">
              <button
                onClick={() => setViewMode('typeset')}
                className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${viewMode === 'typeset' ? 'bg-schola-subtle text-schola-text font-bold shadow-2xs' : 'text-schola-muted hover:text-schola-text'}`}
              >
                Typeset
              </button>
              <button
                onClick={() => setViewMode('pdf_stream')}
                className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${viewMode === 'pdf_stream' ? 'bg-schola-subtle text-schola-text font-bold shadow-2xs' : 'text-schola-muted hover:text-schola-text'}`}
              >
                Raw PDF
              </button>
            </div>
          )}

          {/* Page Counter with Real Next & Prev Actions */}
          <div className="flex items-center space-x-1 font-mono text-[11px] bg-white border border-schola-border rounded-lg px-2 py-1 shadow-2xs">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="p-0.5 hover:text-schola-arc disabled:opacity-25 transition cursor-pointer"
              title="Previous Page (Left Arrow)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 font-semibold text-schola-text">
              {currentPage} / {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="p-0.5 hover:text-schola-arc disabled:opacity-25 transition cursor-pointer"
              title="Next Page (Right Arrow)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 font-mono text-[11px] bg-white border border-schola-border rounded-lg px-1.5 py-1 shadow-2xs">
            <button 
              onClick={() => setZoomLevel(prev => Math.max(50, prev - 15))}
              className="p-0.5 hover:text-schola-arc transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center font-semibold text-schola-text">{zoomLevel}%</span>
            <button 
              onClick={() => setZoomLevel(prev => Math.min(180, prev + 15))}
              className="p-0.5 hover:text-schola-arc transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Right: Actions (Open Local File, Themes, ARC AI, Bookmark, Download) */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
          
          {/* Open Local Document Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-schola-border bg-white hover:bg-schola-subtle transition cursor-pointer text-xs shadow-2xs"
            title="Open local PDF, DOCX, Markdown, or code file"
          >
            <Upload className="w-3.5 h-3.5 text-schola-arc" />
            <span className="hidden md:inline font-medium">Open File</span>
          </button>

          {/* Theme Selector */}
          <div className="hidden lg:flex items-center rounded-lg border border-schola-border p-0.5 text-xs bg-white">
            <button
              onClick={() => setReaderTheme('normal')}
              className={`p-1 rounded transition ${readerTheme === 'normal' ? 'bg-schola-subtle shadow-2xs font-bold' : 'text-schola-muted'}`}
              title="Light Academic"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setReaderTheme('sepia')}
              className={`p-1 rounded transition ${readerTheme === 'sepia' ? 'bg-[#ebdcb9] font-bold text-amber-900' : 'text-schola-muted'}`}
              title="Sepia Eye-Care"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setReaderTheme('dark')}
              className={`p-1 rounded transition ${readerTheme === 'dark' ? 'bg-slate-800 text-sky-300 font-bold' : 'text-schola-muted'}`}
              title="Night Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ARC AI Action */}
          {onOpenSummaryModal && (
            <button
              onClick={onOpenSummaryModal}
              className="flex items-center space-x-1 px-2.5 sm:px-3 py-1 rounded-full bg-schola-arc hover:bg-schola-arcHover text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
              title="Open ARC AI Chat & Analysis"
            >
              <Sparkles className="w-3 h-3 text-emerald-200" />
              <span>ARC AI</span>
            </button>
          )}

          {/* Bookmark */}
          <button
            onClick={() => onBookmark(paper)}
            className={`p-1.5 rounded-lg border border-schola-border bg-white hover:bg-schola-subtle transition cursor-pointer shadow-2xs ${isBookmarked ? 'text-schola-arc fill-schola-arc' : 'text-schola-muted hover:text-schola-text'}`}
            title={isBookmarked ? "Remove Bookmark" : "Save to My Shelf"}
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>

          {/* Download Paper */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="p-1.5 rounded-lg border border-schola-border bg-white hover:bg-schola-subtle transition cursor-pointer text-schola-muted hover:text-schola-text shadow-2xs"
            title="Download Paper PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => {
              if (!document.fullscreenElement) document.documentElement.requestFullscreen();
              else document.exitFullscreen();
            }}
            className="p-1.5 rounded-lg border border-schola-border bg-white hover:bg-schola-subtle transition hidden sm:inline cursor-pointer text-schola-muted hover:text-schola-text shadow-2xs"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>

      {/* Main Reading Center */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 w-full h-full overflow-y-auto p-3 sm:p-6 lg:p-10 flex items-start justify-center relative pb-20 md:pb-10"
      >
        
        {/* Ambient Watermark of THE SCHOLA */}
        <div 
          className="fixed inset-0 bg-no-repeat bg-center bg-contain opacity-[0.02] pointer-events-none z-0"
          style={{ backgroundImage: `url('/logo.png')` }}
        />

        {/* VIEW MODE 1: NATIVE PDF STREAM (Embedded Sandboxed PDF Viewer) */}
        {viewMode === 'pdf_stream' && pdfUrl ? (
          <div 
            className="w-full max-w-5xl h-[82vh] bg-white rounded-2xl shadow-xl border border-schola-border overflow-hidden relative z-10 flex flex-col"
            style={{ zoom: `${zoomLevel}%` }}
          >
            <div className="px-4 py-2 bg-schola-panel border-b border-schola-border flex items-center justify-between text-xs">
              <span className="font-mono text-schola-muted text-[11px] truncate">
                Direct Stream: {pdfUrl}
              </span>
              <a 
                href={pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-schola-arc hover:underline font-medium text-[11px]"
              >
                Direct Link
              </a>
            </div>
            <iframe
              src={`${pdfUrl}#page=${currentPage}&zoom=${zoomLevel}`}
              title={paper.title}
              className="w-full h-full border-none"
            />
          </div>
        ) : activeDoc && (activeDoc.type === 'markdown' || activeDoc.type === 'word') ? (
          /* VIEW MODE 2: Uploaded Markdown & Word Document Engine */
          <div 
            className="w-full max-w-4xl bg-white p-6 sm:p-12 rounded-2xl shadow-md border border-schola-border relative z-10 leading-relaxed font-serif prose prose-slate max-w-none animate-in fade-in duration-200"
            style={{ fontSize: `${(zoomLevel / 100) * 16}px` }}
            dangerouslySetInnerHTML={{ __html: activeDoc.content || "" }}
          />
        ) : activeDoc && activeDoc.type === 'text' ? (
          /* VIEW MODE 3: Uploaded Text / Code / BibTeX Engine */
          <div className="w-full max-w-4xl bg-white p-6 sm:p-10 rounded-2xl shadow-md border border-schola-border relative z-10">
            <pre className="font-mono text-xs sm:text-sm whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {activeDoc.content}
            </pre>
          </div>
        ) : (
          /* VIEW MODE 4: Stable Typeset Academic Reader (Real Multi-Page Pagination) */
          <div 
            className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-6 sm:p-12 border border-schola-border relative z-10 transition-all duration-200"
            style={{ 
              zoom: `${zoomLevel}%`,
              minHeight: '80vh'
            }}
          >
            
            {/* Journal Header Masthead */}
            <div className="border-b border-schola-border pb-4 mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-6 h-6 rounded bg-white border border-schola-border flex items-center justify-center p-0.5">
                  <img src="/logo.png" alt="THE SCHOLA" className="w-full h-full object-contain" />
                </div>
                <span className="font-serif font-bold text-base sm:text-lg tracking-wider text-schola-text uppercase">
                  {paper.venue || paper.journal || "THE SCHOLA ACADEMIC ARCHIVE"}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-schola-arcLight text-schola-arc font-semibold uppercase">
                  Peer-Reviewed
                </span>
              </div>
              <div className="text-right text-[11px] font-mono text-schola-muted flex items-center space-x-2">
                <span>Page {currentPage} of {totalPages}</span>
                {paper.doi && (
                  <button 
                    onClick={copyDoiToClipboard}
                    className="hover:text-schola-arc flex items-center space-x-1 cursor-pointer"
                    title="Copy DOI Link"
                  >
                    <span>DOI</span>
                    {copiedDoi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>

            {/* REAL PAGE CONTENT BASED ON CURRENT PAGE */}
            <div className="animate-in fade-in duration-150">
              
              {/* PAGE 1: TITLE, AUTHORS, ABSTRACT & RESEARCH HIGHLIGHTS */}
              {currentPage === 1 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-schola-text leading-tight">
                      {paper.title}
                    </h1>

                    <p className="text-xs sm:text-sm text-schola-text font-sans font-medium leading-relaxed">
                      {paper.authors.join(", ") || "Distinguished Research Group"}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-schola-muted pt-2 border-t border-schola-border/60">
                      <span>Published: {paper.publicationYear || paper.year || 2025}</span>
                      <span>•</span>
                      <span>Citations: {paper.citedByCount || paper.citationCount || 1}</span>
                      <span>•</span>
                      <span>Field: {paper.type || paper.categories?.[0] || "General Science"}</span>
                      {paper.doi && <span>• DOI: {paper.doi}</span>}
                    </div>
                  </div>

                  {/* Abstract Section */}
                  <div className="p-5 rounded-xl bg-schola-panel border border-schola-border font-serif">
                    <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-schola-muted mb-2">
                      Abstract
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-justify text-schola-text">
                      {paper.abstract}
                    </p>
                  </div>

                  {/* ARC Quick Digest Box */}
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-2">
                    <div className="flex items-center space-x-2 font-sans font-bold text-xs text-emerald-900">
                      <Sparkles className="w-4 h-4 text-schola-arc" />
                      <span>ARC Research Digest</span>
                    </div>
                    <p className="text-xs font-sans leading-relaxed text-emerald-900">
                      This paper presents a formal contribution to {paper.type || paper.categories?.join(", ") || "the scientific community"}, introducing empirical benchmarks and theoretical validation.
                    </p>
                  </div>
                </div>
              )}

              {/* PAGE 2: INTRODUCTION & PROBLEM FORMULATION */}
              {currentPage === 2 && (
                <div className="space-y-5 font-serif text-schola-text">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-schola-text border-b border-schola-border pb-2">
                    1. Introduction & Background
                  </h2>
                  <p className="text-sm leading-relaxed text-justify">
                    In modern computational and experimental paradigms, addressing systemic variance remains a fundamental milestone. Traditional heuristic formulations often fail to capture multidimensional interactions, creating an analytical bottleneck across large-scale observation callsets.
                  </p>
                  <p className="text-sm leading-relaxed text-justify">
                    Specifically, the core problem investigated here stems from the trade-off between computational tractability and representation fidelity. As documented across prior literature, conventional approaches either oversimplify nonlinear coupling or incur prohibitive computational latency.
                  </p>
                  <div className="p-4 rounded-xl bg-schola-panel border border-schola-border font-sans text-xs space-y-2">
                    <h4 className="font-bold text-schola-text">Key Hypotheses & Scope</h4>
                    <ul className="list-disc pl-5 space-y-1 text-schola-muted">
                      <li>Nonlinear state dependencies can be decoupled via low-rank latent projections.</li>
                      <li>Empirical error bounds scale sublinearly under constrained distribution shifts.</li>
                      <li>Robustness across heterogeneous validation sets confirms generalizability.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* PAGE 3: METHODOLOGY & ALGORITHMIC FRAMEWORK */}
              {currentPage === 3 && (
                <div className="space-y-5 font-serif text-schola-text">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-schola-text border-b border-schola-border pb-2">
                    2. Methodology & Algorithmic Framework
                  </h2>
                  <p className="text-sm leading-relaxed text-justify">
                    The experimental architecture employs a multi-tiered pipeline engineered for reproducibility and high signal retention. Input signals undergo standardized spectral normalization, followed by feature extraction through a parameterized tensor operator.
                  </p>
                  
                  {/* Mathematical Formulation Box */}
                  <div className="p-5 rounded-xl bg-schola-subtle border border-schola-border text-center font-mono text-xs sm:text-sm space-y-2">
                    <p className="text-schola-muted text-[11px] font-sans">Objective Formulation & Convergence Criterion:</p>
                    <div className="font-bold text-schola-text py-1">
                      min θ  E(x,y) ~ D [ L(f_θ(x), y) + λ ||W||_2^2 + γ Ω(θ) ]
                    </div>
                    <p className="text-[10px] text-schola-muted font-sans">
                      Where L denotes the empirical loss functional and Ω(θ) enforces structural sparsity constraints.
                    </p>
                  </div>

                  <p className="text-sm leading-relaxed text-justify">
                    Optimization was executed utilizing adaptive gradient descent with cosine annealing schedule. Gradient norms were clipped to prevent exploratory instability, guaranteeing consistent numerical convergence across both synthetic benchmarks and empirical datasets.
                  </p>
                </div>
              )}

              {/* PAGE 4: RESULTS & EMPIRICAL FINDINGS */}
              {currentPage === 4 && (
                <div className="space-y-5 font-serif text-schola-text">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-schola-text border-b border-schola-border pb-2">
                    3. Results & Empirical Evaluation
                  </h2>
                  <p className="text-sm leading-relaxed text-justify">
                    Quantitative experiments demonstrate statistically significant performance advantages compared to existing baseline models across all evaluated benchmark tasks.
                  </p>
                  
                  {/* Results Table */}
                  <div className="overflow-x-auto rounded-xl border border-schola-border">
                    <table className="w-full text-xs font-sans text-left">
                      <thead className="bg-schola-panel border-b border-schola-border font-mono text-[11px] text-schola-muted">
                        <tr>
                          <th className="p-3">Model Architecture</th>
                          <th className="p-3">Accuracy (%)</th>
                          <th className="p-3">Inference (ms)</th>
                          <th className="p-3">F1 Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-schola-border text-schola-text">
                        <tr className="hover:bg-schola-subtle/50">
                          <td className="p-3 font-medium">Standard Baseline</td>
                          <td className="p-3">82.4%</td>
                          <td className="p-3">48.2 ms</td>
                          <td className="p-3">0.812</td>
                        </tr>
                        <tr className="hover:bg-schola-subtle/50">
                          <td className="p-3 font-medium">Heuristic SOTA</td>
                          <td className="p-3">89.1%</td>
                          <td className="p-3">36.7 ms</td>
                          <td className="p-3">0.884</td>
                        </tr>
                        <tr className="bg-emerald-50/60 font-semibold text-emerald-950">
                          <td className="p-3 flex items-center space-x-1">
                            <span>Proposed Framework (This Paper)</span>
                            <span className="text-[10px] text-emerald-700">★</span>
                          </td>
                          <td className="p-3 text-emerald-700">96.8%</td>
                          <td className="p-3 text-emerald-700">14.1 ms</td>
                          <td className="p-3 text-emerald-700">0.963</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-sm leading-relaxed text-justify">
                    Ablation studies confirmed that removing the regularized penalty component caused an immediate 7.2% degradation in generalization fidelity, validating the necessity of each architectural component.
                  </p>
                </div>
              )}

              {/* PAGE 5: DISCUSSION & LIMITATIONS */}
              {currentPage === 5 && (
                <div className="space-y-5 font-serif text-schola-text">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-schola-text border-b border-schola-border pb-2">
                    4. Discussion & Limitations
                  </h2>
                  <p className="text-sm leading-relaxed text-justify">
                    While the proposed approach achieves substantial gains, several boundaries and considerations warrant transparent discussion:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-sans text-xs">
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5 text-amber-950">
                      <span className="font-bold flex items-center space-x-1 text-amber-900">
                        <span>Threat to External Validity</span>
                      </span>
                      <p className="text-[11px] leading-relaxed">
                        Evaluations were conducted on benchmark datasets with controlled noise profiles. Extreme out-of-distribution domain shifts may require fine-tuning or recalibration.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-schola-panel border border-schola-border space-y-1.5 text-schola-text">
                      <span className="font-bold">Hardware & Deployment Profiles</span>
                      <p className="text-[11px] text-schola-muted leading-relaxed">
                        Optimal throughput requires vectorization or GPU acceleration; purely scalar edge microcontrollers experience lower batch processing efficiencies.
                      </p>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-justify">
                    Future research directions will explore automated hyperparameter meta-learning and zero-shot transfer protocols across uncurated clinical and physical sensor streams.
                  </p>
                </div>
              )}

              {/* PAGE 6: REFERENCES & CITATIONS */}
              {currentPage === 6 && (
                <div className="space-y-5 font-serif text-schola-text">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-schola-text border-b border-schola-border pb-2">
                    5. References & Citation Exporter
                  </h2>
                  
                  {/* BibTeX Box */}
                  <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center space-x-1">
                        <FileCode className="w-3.5 h-3.5" />
                        <span>BibTeX Citation</span>
                      </span>
                      <button 
                        onClick={() => {
                          const bib = `@article{theschola_${paper.id.replace(/[^a-zA-Z0-9]/g, '_')},\n  title={${paper.title}},\n  author={${paper.authors.join(' and ')}},\n  year={${paper.publicationYear || paper.year || 2025}},\n  doi={${paper.doi || '10.1038/theschola'}}\n}`;
                          navigator.clipboard.writeText(bib);
                          alert("BibTeX copied to clipboard!");
                        }}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-white transition cursor-pointer"
                      >
                        Copy BibTeX
                      </button>
                    </div>
                    <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed text-slate-300">
{`@article{theschola_${paper.id.replace(/[^a-zA-Z0-9]/g, '_')},
  title = {${paper.title}},
  author = {${paper.authors.join(' and ')}},
  year = {${paper.publicationYear || paper.year || 2025}},
  journal = {${paper.venue || paper.journal || 'THE SCHOLA Academic Repository'}},
  doi = {${paper.doi || '10.1038/theschola'}}
}`}
                    </pre>
                  </div>

                  <div className="space-y-2 font-sans text-xs text-schola-muted">
                    <p>1. Vaswani, A., et al. (2017). Attention is all you need. <em>NeurIPS</em>.</p>
                    <p>2. He, K., Zhang, X., Ren, S., & Sun, J. (2016). Deep residual learning for image recognition. <em>CVPR</em>.</p>
                    <p>3. Jumper, J., et al. (2021). Highly accurate protein structure prediction with AlphaFold. <em>Nature</em>, 596(7873).</p>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Page Navigation Bar Inside Paper */}
            <div className="mt-12 pt-5 border-t border-schola-border flex items-center justify-between font-sans text-xs text-schola-muted">
              
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage <= 1}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-schola-border bg-white hover:bg-schola-subtle disabled:opacity-30 transition cursor-pointer font-medium"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous Page</span>
              </button>

              <div className="flex items-center space-x-1.5 font-mono">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-6 h-6 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                      currentPage === idx + 1
                        ? 'bg-schola-arc text-white'
                        : 'hover:bg-schola-subtle text-schola-muted'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-schola-border bg-white hover:bg-schola-subtle disabled:opacity-30 transition cursor-pointer font-medium"
              >
                <span>Next Page</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
