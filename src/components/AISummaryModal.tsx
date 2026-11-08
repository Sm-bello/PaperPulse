import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Cpu, 
  CheckCircle2, 
  Copy, 
  BookOpen, 
  AlertTriangle, 
  RefreshCw,
  Zap
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

Generated via PaperPulse AI (${summary.mode} mode)`;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
                <span>Pre-Read AI Executive Summary</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Analyze before reading · Generated at {summary?.generatedAt || "just now"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper Metadata Banner */}
        <div className="px-5 py-3 bg-slate-950/50 border-b border-slate-800/80 text-xs">
          <h4 className="font-semibold text-slate-200 line-clamp-2">{paper.title}</h4>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-slate-400">
            <span>{paper.authors.slice(0, 3).join(", ")}</span>
            <span>•</span>
            <span className="text-sky-400 font-medium">{paper.venue}</span>
            <span>•</span>
            <span className="font-mono">{paper.publicationYear}</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
          
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
              <p className="text-slate-300 font-medium">Synthesizing deep paper analysis...</p>
              <p className="text-xs text-slate-500">Parsing abstract, technical claims, and quantitative metrics.</p>
            </div>
          ) : summary ? (
            <>
              {/* Mode Pill & Quick Toggle */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  {summary.mode === 'online' ? (
                    <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 font-mono">
                      <Zap className="w-3 h-3" />
                      <span>Online (Gemini 2.5 Flash)</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-400 border border-amber-800/50 font-mono">
                      <Cpu className="w-3 h-3" />
                      <span>Offline Edge Engine</span>
                    </span>
                  )}
                  <span className="text-slate-500 hidden sm:inline">Zero-data cache ready</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleRegenerate('online')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px]"
                  >
                    Gemini Mode
                  </button>
                  <button
                    onClick={() => handleRegenerate('offline')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px]"
                  >
                    Offline NLP
                  </button>
                </div>
              </div>

              {/* 💡 TL;DR Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/30 to-indigo-950/20 border border-sky-800/40">
                <h5 className="font-semibold text-sky-300 flex items-center space-x-1.5 text-xs uppercase tracking-wider mb-2 font-mono">
                  <span>💡 Executive TL;DR</span>
                </h5>
                <ul className="space-y-1.5 text-slate-200 text-xs sm:text-sm">
                  {summary.tldr.map((bullet, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-sky-400 mt-1">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 🎯 Core Thesis */}
              <div className="space-y-1">
                <h5 className="text-xs uppercase font-mono font-semibold text-slate-400 tracking-wider">
                  🎯 Core Objective & Problem Solved
                </h5>
                <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                  {summary.coreThesis}
                </p>
              </div>

              {/* 🔬 Methodology */}
              <div className="space-y-1">
                <h5 className="text-xs uppercase font-mono font-semibold text-slate-400 tracking-wider">
                  🔬 Methodology & Technical Setup
                </h5>
                <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                  {summary.methodology}
                </p>
              </div>

              {/* 📊 Key Findings */}
              <div className="space-y-1">
                <h5 className="text-xs uppercase font-mono font-semibold text-emerald-400 tracking-wider">
                  📊 Key Quantitative Breakthroughs
                </h5>
                <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                  {summary.keyFindings}
                </p>
              </div>

              {/* ⚠️ Limitations */}
              <div className="space-y-1">
                <h5 className="text-xs uppercase font-mono font-semibold text-amber-400 tracking-wider flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Operational Limitations</span>
                </h5>
                <p className="text-slate-400 leading-relaxed text-xs sm:text-sm">
                  {summary.limitations}
                </p>
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-center py-6">No summary generated.</p>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onReadPaper(paper);
              }}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium shadow-md shadow-sky-500/20 transition cursor-pointer"
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
