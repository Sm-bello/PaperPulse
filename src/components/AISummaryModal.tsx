import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Cpu, 
  Copy, 
  BookOpen, 
  AlertTriangle, 
  RefreshCw,
  Zap,
  Check
} from 'lucide-react';
import type { Paper, AISummary } from '../types';
import { getPaperSummary } from '../services/aiSummarizer';

interface AISummaryModalProps {
  paper: Paper;
  summary: AISummary | null;
  onClose: () => void;
  onReadPaper: (paper: Paper) => void;
  onUpdateSummary: (newSummary: AISummary) => void;
}

export const AISummaryModal: React.FC<AISummaryModalProps> = ({
  paper,
  summary,
  onClose,
  onReadPaper,
  onUpdateSummary,
}) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopy = () => {
    if (!summary) return;
    const text = `Title: ${paper.title} (${paper.publicationYear})
Venue: ${paper.venue}

TL;DR:
${summary.tldr.map(b => `• ${b}`).join("\n")}

Core Thesis:
${summary.coreThesis}

Methodology:
${summary.methodology}

Key Findings:
${summary.keyFindings}

Limitations:
${summary.limitations}

Generated via THE SCHOLA / PaperPulse ARC AI (${summary.mode} mode)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async (mode: 'online' | 'offline') => {
    setLoading(true);
    try {
      const updated = await getPaperSummary(paper, mode);
      onUpdateSummary(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white border border-schola-border shadow-2xl overflow-hidden">
        
        {/* Subtle Watermark */}
        <div 
          className="absolute inset-0 bg-no-repeat bg-center bg-contain opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: `url('/logo.png')` }}
        />

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-schola-border bg-schola-panel relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-schola-arcLight text-schola-arc flex items-center justify-center border border-schola-arc/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-schola-text">
                ARC AI Executive Paper Synthesis
              </h3>
              <p className="text-[11px] text-schola-muted font-mono">
                THE SCHOLA Intelligence · Synthesized at {summary?.generatedAt || "just now"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-schola-muted hover:text-schola-text hover:bg-schola-subtle transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper Metadata Banner */}
        <div className="px-5 py-3 bg-schola-bg border-b border-schola-border text-xs relative z-10">
          <h4 className="font-serif font-bold text-schola-text leading-snug line-clamp-2">{paper.title}</h4>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-schola-muted">
            <span>{paper.authors.slice(0, 3).join(", ")}</span>
            <span>•</span>
            <span className="text-schola-arc font-medium font-serif">{paper.venue}</span>
            <span>•</span>
            <span className="font-mono">{paper.publicationYear}</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm relative z-10">
          
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-schola-arc animate-spin" />
              <p className="font-serif text-base font-bold text-schola-text">Synthesizing deep paper analysis...</p>
              <p className="text-xs text-schola-muted">Parsing technical claims, methodology equations, and experimental metrics.</p>
            </div>
          ) : summary ? (
            <>
              {/* Mode Pill & Quick Toggle */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-schola-panel border border-schola-border text-xs">
                <div className="flex items-center space-x-2">
                  {summary.mode === 'online' ? (
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[11px]">
                      <Zap className="w-3 h-3" />
                      <span>Online (Gemini 2.5 Flash)</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[11px]">
                      <Cpu className="w-3 h-3" />
                      <span>Offline Edge Engine</span>
                    </span>
                  )}
                  <span className="text-schola-muted hidden sm:inline text-[11px]">Zero-data cached</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleRegenerate('online')}
                    className="px-2 py-1 rounded bg-white hover:bg-schola-subtle border border-schola-border text-schola-text transition text-[11px] cursor-pointer"
                  >
                    Gemini Mode
                  </button>
                  <button
                    onClick={() => handleRegenerate('offline')}
                    className="px-2 py-1 rounded bg-white hover:bg-schola-subtle border border-schola-border text-schola-text transition text-[11px] cursor-pointer"
                  >
                    Offline NLP
                  </button>
                </div>
              </div>

              {/* 💡 TL;DR Box */}
              <div className="p-4 rounded-xl bg-schola-arcLight border border-schola-arc/20">
                <h5 className="font-mono text-schola-arc font-bold text-xs uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Executive TL;DR</span>
                </h5>
                <ul className="space-y-1.5 text-schola-text text-xs leading-relaxed">
                  {summary.tldr.map((bullet, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-schola-arc font-bold">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 🎯 Core Thesis */}
              <div className="space-y-1">
                <h5 className="font-mono text-[10px] uppercase font-bold text-schola-muted tracking-wider">
                  🎯 Core Objective & Problem Solved
                </h5>
                <p className="text-schola-text leading-relaxed text-xs">
                  {summary.coreThesis}
                </p>
              </div>

              {/* 🔬 Methodology */}
              <div className="space-y-1">
                <h5 className="font-mono text-[10px] uppercase font-bold text-schola-muted tracking-wider">
                  🔬 Technical Architecture & Methodology
                </h5>
                <p className="text-schola-text leading-relaxed text-xs">
                  {summary.methodology}
                </p>
              </div>

              {/* 📊 Key Findings */}
              <div className="space-y-1">
                <h5 className="font-mono text-[10px] uppercase font-bold text-schola-arc tracking-wider">
                  📊 Key Quantitative Findings
                </h5>
                <p className="text-schola-text leading-relaxed text-xs">
                  {summary.keyFindings}
                </p>
              </div>

              {/* ⚠️ Limitations */}
              <div className="space-y-1">
                <h5 className="font-mono text-[10px] uppercase font-bold text-amber-800 tracking-wider flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Operational Limitations</span>
                </h5>
                <p className="text-schola-muted leading-relaxed text-xs">
                  {summary.limitations}
                </p>
              </div>
            </>
          ) : (
            <p className="text-schola-muted text-center py-6">No summary available.</p>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-schola-border bg-schola-panel flex items-center justify-between relative z-10">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-schola-border bg-white hover:bg-schola-subtle text-xs font-medium text-schola-text transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-schola-arc" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-schola-muted hover:text-schola-text transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onReadPaper(paper);
              }}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-schola-arc hover:bg-schola-arcHover text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read Full Paper</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
