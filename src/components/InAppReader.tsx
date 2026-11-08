import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  Download, 
  Sparkles, 
  Moon, 
  Sun, 
  Eye, 
  Bookmark, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  Upload,
  RotateCw,
  Maximize2,
  ChevronLeft,
  ChevronRight
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
  const [zoomLevel, setZoomLevel] = useState<number>(85);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 27;
  const [rotation, setRotation] = useState<number>(0);
  const [downloading, setDownloading] = useState(false);
  const [activeDoc, setActiveDoc] = useState<ParsedDocument | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pdfUrl = activeDoc?.url || paper.pdfUrl || paper.landingPageUrl || "";

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
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
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

      {/* Top Reading Navigation Bar (Matching Nature Reader Screenshot) */}
      <div className="h-11 px-3 sm:px-6 border-b border-schola-border flex items-center justify-between text-xs bg-schola-panel/95 backdrop-blur-md z-20">
        
        {/* Back and Title */}
        <div className="flex items-center space-x-2.5 truncate max-w-xs sm:max-w-md">
          <button 
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-schola-subtle text-schola-muted hover:text-schola-text transition cursor-pointer"
            title="Back to Library"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-serif font-bold text-xs sm:text-sm truncate">
            {docTitle}
          </span>
          {activeDoc && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-schola-arcLight text-schola-arc uppercase shrink-0">
              {activeDoc.type}
            </span>
          )}
        </div>

        {/* Center: Page Navigation & Zoom Controls (Exact screenshot match) */}
        <div className="flex items-center space-x-3 text-xs">
          
          {/* Page Counter */}
          <div className="flex items-center space-x-1 font-mono text-[11px] bg-white border border-schola-border rounded-md px-1.5 py-0.5 shadow-2xs">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-0.5 hover:text-schola-arc disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="px-1">{currentPage} / {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="p-0.5 hover:text-schola-arc disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 font-mono text-[11px] bg-white border border-schola-border rounded-md px-1.5 py-0.5 shadow-2xs">
            <button 
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 15))}
              className="p-0.5 hover:text-schola-arc cursor-pointer"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="w-9 text-center font-semibold">{zoomLevel}%</span>
            <button 
              onClick={() => setZoomLevel(Math.min(180, zoomLevel + 15))}
              className="p-0.5 hover:text-schola-arc cursor-pointer"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

        </div>

        {/* Right Reading Action Controls */}
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          
          {/* Open Local Document Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md border border-schola-border bg-white hover:bg-schola-subtle transition cursor-pointer text-xs shadow-2xs"
            title="Open local PDF, DOCX, Markdown, or text file"
          >
            <Upload className="w-3.5 h-3.5 text-schola-arc" />
            <span className="hidden md:inline font-medium">Open File</span>
          </button>

          {/* Rotate */}
          <button
            onClick={handleRotate}
            className="p-1.5 rounded-md hover:bg-schola-subtle text-schola-muted hover:text-schola-text transition cursor-pointer hidden sm:inline"
            title="Rotate Page"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Theme Selector */}
          <div className="hidden lg:flex items-center rounded-lg border border-schola-border p-0.5 text-xs bg-white">
            <button
              onClick={() => setReaderTheme('normal')}
              className={`p-1 rounded ${readerTheme === 'normal' ? 'bg-schola-subtle shadow-2xs font-bold' : 'text-schola-muted'}`}
              title="Light Academic"
            >
              <Sun className="w-3 h-3" />
            </button>
            <button
              onClick={() => setReaderTheme('sepia')}
              className={`p-1 rounded ${readerTheme === 'sepia' ? 'bg-[#ebdcb9] font-bold text-amber-900' : 'text-schola-muted'}`}
              title="Sepia Eye-Care"
            >
              <Eye className="w-3 h-3" />
            </button>
            <button
              onClick={() => setReaderTheme('dark')}
              className={`p-1 rounded ${readerTheme === 'dark' ? 'bg-slate-800 text-sky-300 font-bold' : 'text-schola-muted'}`}
              title="Night Mode"
            >
              <Moon className="w-3 h-3" />
            </button>
          </div>

          {/* ARC AI Action */}
          {onOpenSummaryModal && (
            <button
              onClick={onOpenSummaryModal}
              className="flex items-center space-x-1 px-3 py-1 rounded-full bg-schola-arc hover:bg-schola-arcHover text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
              title="ARC AI Summary"
            >
              <Sparkles className="w-3 h-3 text-emerald-200" />
              <span>ARC</span>
            </button>
          )}

          {/* Download PDF */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="p-1.5 rounded-md hover:bg-schola-subtle transition cursor-pointer text-schola-muted hover:text-schola-text"
            title="Save file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Bookmark */}
          <button
            onClick={() => onBookmark(paper)}
            className={`p-1.5 rounded-md hover:bg-schola-subtle transition cursor-pointer ${isBookmarked ? 'text-schola-arc' : 'text-schola-muted hover:text-schola-text'}`}
            title="Bookmark"
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* Print */}
          <button
            onClick={() => window.print()}
            className="p-1.5 rounded-md hover:bg-schola-subtle transition hidden md:inline cursor-pointer text-schola-muted hover:text-schola-text"
            title="Print Document"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => {
              if (!document.fullscreenElement) document.documentElement.requestFullscreen();
              else document.exitFullscreen();
            }}
            className="p-1.5 rounded-md hover:bg-schola-subtle transition hidden sm:inline cursor-pointer text-schola-muted hover:text-schola-text"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* External DOI link */}
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md hover:bg-schola-subtle transition text-schola-muted hover:text-schola-text"
              title="Open direct paper link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

        </div>

      </div>

      {/* Main Stretching Reading Canvas */}
      <div className="flex-1 w-full h-full overflow-y-auto p-4 sm:p-6 lg:p-10 flex items-start justify-center relative">
        
        {/* Ambient Watermark of THE SCHOLA */}
        <div 
          className="fixed inset-0 bg-no-repeat bg-center bg-contain opacity-[0.024] pointer-events-none z-0"
          style={{ backgroundImage: `url('/logo.png')` }}
        />

        {/* 1. Markdown & Word Document Render Engine */}
        {activeDoc && (activeDoc.type === 'markdown' || activeDoc.type === 'word') ? (
          <div 
            className="w-full max-w-4xl bg-white p-6 sm:p-12 rounded-xl shadow-xs border border-schola-border relative z-10 leading-relaxed font-serif prose prose-slate max-w-none"
            style={{ fontSize: `${(zoomLevel / 100) * 16}px` }}
            dangerouslySetInnerHTML={{ __html: activeDoc.content || "" }}
          />
        ) : activeDoc && activeDoc.type === 'text' ? (
          /* 2. Plain Text / Code / BibTeX Engine */
          <div className="w-full max-w-4xl bg-white p-6 sm:p-10 rounded-xl shadow-xs border border-schola-border relative z-10">
            <pre className="font-mono text-xs sm:text-sm whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {activeDoc.content}
            </pre>
          </div>
        ) : (
          /* 3. Typeset Academic Journal Document (Nature Metabolism Reference from Screenshot) */
          <div 
            className="w-full max-w-4xl bg-white shadow-md rounded-xl p-6 sm:p-12 border border-schola-border relative z-10 transition-transform duration-200"
            style={{ 
              transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`, 
              transformOrigin: 'top center' 
            }}
          >
            {/* Journal Header Masthead */}
            <div className="border-b border-schola-border pb-4 mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-serif font-extrabold text-xl sm:text-2xl tracking-tight text-schola-text lowercase">
                  nature metabolism
                </span>
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
                  a
                </span>
              </div>
              <div className="text-right text-[11px] font-mono text-schola-muted">
                <span>Article</span> · <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" className="hover:text-schola-arc underline">https://doi.org/{paper.doi || "10.1038/s42255-025-01410-x"}</a>
              </div>
            </div>

            {/* Paper Title & Authors */}
            <div className="space-y-4 mb-8">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-schola-text leading-tight">
                {paper.title}
              </h1>

              {/* Authors List */}
              <p className="text-xs sm:text-sm text-schola-text leading-relaxed font-sans font-medium">
                {paper.authors.join(", ")}
              </p>

              {/* Publication Metadata */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-schola-muted pt-2 border-t border-schola-border/60">
                <span>Received: 17 November 2023</span>
                <span>•</span>
                <span>Accepted: 21 October 2025</span>
                <span>•</span>
                <span>Published online: 5 December 2025</span>
                <span className="ml-auto px-2 py-0.5 rounded-full bg-schola-subtle border border-schola-border text-schola-text text-[10px] font-sans font-semibold">
                  ✓ Check for updates
                </span>
              </div>
            </div>

            {/* Two-Column Academic Paper Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-schola-text font-serif leading-relaxed text-sm">
              
              {/* Left Column: Abstract & Introduction */}
              <div className="space-y-4">
                <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-schola-muted">
                  Abstract
                </h3>
                <p className="font-medium text-justify">
                  {paper.abstract}
                </p>

                <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-schola-muted pt-4">
                  Introduction & Metabolic Rewiring
                </h3>
                <p className="text-justify text-xs sm:text-sm text-schola-muted leading-relaxed">
                  Acute myeloid leukaemia (AML) cells exhibit substantial metabolic plasticity, depending extensively on both mitochondrial oxidative phosphorylation (OXPHOS) and nucleotide biosynthesis for clonal expansion. In this study, genome-wide CRISPR coessentiality mapping identified succinate dehydrogenase (complex II) as an indispensable contributor to the purine synthetic cascade.
                </p>
              </div>

              {/* Right Column: Metabolic Circuit & Key Findings */}
              <div className="space-y-4">
                
                {/* Figure / Circuit Diagram */}
                <div className="p-4 rounded-xl bg-schola-panel border border-schola-border">
                  <span className="font-sans font-bold text-[11px] text-schola-text block mb-2">
                    Fig. 1 | Complex II – Purine Biosynthesis Coupling Circuit
                  </span>
                  <div className="p-3 bg-white rounded-lg border border-schola-border/80 font-mono text-[11px] text-center space-y-2">
                    <div className="p-1.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold">
                      Glutamine [Gln]
                    </div>
                    <div className="text-schola-muted text-[10px]">
                      ↓ (Nitrogen donation to purine ring)
                    </div>
                    <div className="p-1.5 rounded bg-sky-50 text-sky-900 border border-sky-200 font-semibold">
                      De Novo Purine Ring (IMP / AMP / GMP)
                    </div>
                    <div className="text-schola-muted text-[10px]">
                      ↓ Byproduct: Glutamate [Glu]
                    </div>
                    <div className="p-1.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-semibold">
                      Complex II (Succinate Dehydrogenase) → OXPHOS
                    </div>
                  </div>
                  <p className="text-[10px] text-schola-muted mt-2.5 leading-normal">
                    Metabolomic tracing confirms that complex II deficiency induces lethal purine starvation in AML blast cells, reversible by exogenous adenosine/guanosine rescue.
                  </p>
                </div>

                {/* Key Findings Box */}
                <div className="p-4 rounded-xl bg-[#fbf8f0] border border-[#e8ddc8] text-xs space-y-2">
                  <h4 className="font-sans font-bold text-schola-text flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-schola-arc" />
                    <span>ARC Synthesis Notes</span>
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-schola-muted text-[11px] font-sans">
                    <li>Complex II acts as an essential metabolic sink for purine-derived glutamate.</li>
                    <li>Syngeneic mouse models demonstrated dramatic tumor regression upon dual targeting.</li>
                    <li>Translational synergy observed with venetoclax and azacitidine regimens.</li>
                  </ul>
                </div>

              </div>

            </div>

            {/* Bottom Footer Details */}
            <div className="mt-10 pt-4 border-t border-schola-border flex items-center justify-between text-xs text-schola-muted font-sans">
              <span>Nature Metabolism · Vol 7, Issue 12 · pp. 2474–2485</span>
              <button 
                onClick={onOpenSummaryModal}
                className="text-schola-arc hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <span>Open Full ARC Synthesis</span>
                <Sparkles className="w-3 h-3" />
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
