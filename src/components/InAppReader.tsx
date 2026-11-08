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
  FileText
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

  const getContainerThemeStyle = () => {
    switch (readerTheme) {
      case 'dark':
        return 'bg-slate-900 text-slate-100';
      case 'sepia':
        return 'bg-[#fbf3e4] text-[#433422]';
      default:
        return 'bg-[#fcfaf6] text-[#22201d]';
    }
  };

  const getViewerStyle = () => {
    switch (readerTheme) {
      case 'dark':
        return 'filter invert-[0.92] hue-rotate-180 contrast-125 bg-slate-900';
      case 'sepia':
        return 'filter sepia-[0.35] brightness-[0.95] contrast-[0.95] bg-[#faf3e8]';
      default:
        return 'bg-white';
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
      <div className="h-11 px-3 sm:px-6 border-b border-schola-border flex items-center justify-between text-xs backdrop-blur-md">
        
        {/* Back and Title */}
        <div className="flex items-center space-x-2.5 truncate max-w-md sm:max-w-xl">
          <button 
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-schola-subtle text-schola-muted hover:text-schola-text transition cursor-pointer"
            title="Back to Library"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-serif font-bold text-sm truncate">
            {docTitle}
          </span>
          {activeDoc && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-schola-arcLight text-schola-arc uppercase">
              {activeDoc.type}
            </span>
          )}
        </div>

        {/* Reading Controls */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          
          {/* Open Local Document Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md border border-schola-border hover:bg-schola-subtle transition cursor-pointer text-xs"
            title="Open local PDF, DOCX, Markdown, or text file"
          >
            <Upload className="w-3.5 h-3.5 text-schola-arc" />
            <span className="hidden sm:inline">Open File</span>
          </button>

          {/* Theme Selector */}
          <div className="flex items-center rounded-lg border border-schola-border p-0.5 text-xs">
            <button
              onClick={() => setReaderTheme('normal')}
              className={`p-1 rounded ${readerTheme === 'normal' ? 'bg-white shadow-2xs font-bold' : 'text-schola-muted'}`}
              title="Light Mode"
            >
              <Sun className="w-3 h-3" />
            </button>
            <button
              onClick={() => setReaderTheme('sepia')}
              className={`p-1 rounded ${readerTheme === 'sepia' ? 'bg-[#ebdcb9] font-bold text-amber-900' : 'text-schola-muted'}`}
              title="Sepia Eye-Care Mode"
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

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center space-x-1 font-mono text-xs">
            <button 
              onClick={() => setZoomLevel(Math.max(60, zoomLevel - 15))}
              className="p-1 hover:text-schola-arc transition cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] w-10 text-center">{zoomLevel}%</span>
            <button 
              onClick={() => setZoomLevel(Math.min(160, zoomLevel + 15))}
              className="p-1 hover:text-schola-arc transition cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ARC AI Action */}
          {onOpenSummaryModal && (
            <button
              onClick={onOpenSummaryModal}
              className="flex items-center space-x-1 px-3 py-1 rounded-md bg-schola-arc hover:bg-schola-arcHover text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
              title="ARC AI Summary"
            >
              <Sparkles className="w-3 h-3 text-emerald-200" />
              <span>ARC Notes</span>
            </button>
          )}

          {/* Download PDF */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="p-1.5 rounded-md hover:bg-schola-subtle transition cursor-pointer"
            title="Save file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Bookmark */}
          <button
            onClick={() => onBookmark(paper)}
            className={`p-1.5 rounded-md hover:bg-schola-subtle transition cursor-pointer ${isBookmarked ? 'text-schola-arc' : ''}`}
            title="Bookmark"
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* Print */}
          <button
            onClick={() => window.print()}
            className="p-1.5 rounded-md hover:bg-schola-subtle transition hidden md:inline cursor-pointer"
            title="Print Document"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {/* External portal link */}
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md hover:bg-schola-subtle transition"
              title="Open direct file link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

        </div>

      </div>

      {/* Main Stretching Reading Canvas */}
      <div className="flex-1 w-full h-full overflow-y-auto p-4 sm:p-8 flex items-start justify-center relative">
        
        {/* Ambient Watermark */}
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
          /* 3. PDF Frame Engine */
          <div 
            className="w-full max-w-5xl h-[calc(100vh-8rem)] bg-white shadow-md rounded-xl overflow-hidden border border-schola-border relative z-10 transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          >
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                title={docTitle}
                className={`w-full h-full border-none transition-all duration-300 ${getViewerStyle()}`}
              />
            ) : (
              <div className="text-center p-12 max-w-md mx-auto">
                <FileText className="w-12 h-12 text-schola-arc mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-schola-text mb-2">
                  Ready to Read
                </h3>
                <p className="text-xs text-schola-muted mb-5 leading-relaxed">
                  Open an open-access PDF from the library, or tap <strong>Open File</strong> to load any local PDF, Word (.docx), or Markdown file.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-schola-arc text-white text-xs font-semibold shadow-2xs hover:bg-schola-arcHover transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Local File to Read</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
