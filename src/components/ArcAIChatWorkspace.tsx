import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Wifi, 
  WifiOff, 
  RotateCcw, 
  Copy, 
  Check, 
  BookOpen, 
  FileText, 
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import type { Paper, AISummary, ChatMessage } from '../types';
import { askArcPaperQuestion, getPaperSummary } from '../services/aiSummarizer';

interface ArcAIChatWorkspaceProps {
  paper: Paper | null;
  availablePapers: Paper[];
  onSelectPaper: (paper: Paper) => void;
  onClose: () => void;
  onReadPaper: (paper: Paper) => void;
}

export const ArcAIChatWorkspace: React.FC<ArcAIChatWorkspaceProps> = ({
  paper,
  availablePapers,
  onSelectPaper,
  onClose,
  onReadPaper,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'summary' | 'methods' | 'limitations'>('chat');
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPaperDropdown, setShowPaperDropdown] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activePaper = paper || availablePapers[0] || null;

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load chat history and summary for active paper
  useEffect(() => {
    if (!activePaper) return;

    // Load summary
    getPaperSummary(activePaper).then(res => setSummary(res));

    // Load chat history
    try {
      const stored = localStorage.getItem(`theschola_arc_chat_${activePaper.id}`);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        // Default initial greeting
        const initialMsg: ChatMessage = {
          id: `welcome-${Date.now()}`,
          sender: 'arc',
          text: `Hello! I am **ARC**, your research intelligence copilot. I have indexed **"${activePaper.title}"** (${activePaper.authors[0] || 'Authors'} et al., ${activePaper.publicationYear}).\n\nWhat would you like to investigate about this paper? You can ask about its methodology, experimental results, mathematical formulations, or select one of the suggested prompts below.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([initialMsg]);
      }
    } catch {
      setMessages([]);
    }
  }, [activePaper?.id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Save chat history
  const saveMessages = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    if (activePaper) {
      try {
        localStorage.setItem(`theschola_arc_chat_${activePaper.id}`, JSON.stringify(newMessages));
      } catch {}
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || inputQuestion).trim();
    if (!q || !activePaper || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [...messages, userMsg];
    saveMessages(updated);
    setInputQuestion('');
    setLoading(true);

    try {
      const aiReplyText = await askArcPaperQuestion(activePaper, q, updated);
      const arcMsg: ChatMessage = {
        id: `arc-${Date.now()}`,
        sender: 'arc',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      saveMessages([...updated, arcMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `arc-err-${Date.now()}`,
        sender: 'arc',
        text: `Unable to complete query: ${err.message || 'Please check your connection and try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      saveMessages([...updated, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (!activePaper) return;
    const initialMsg: ChatMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'arc',
      text: `Chat cleared for "${activePaper.title}". What would you like to explore?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    saveMessages([initialMsg]);
  };

  const QUICK_PROMPTS = [
    { label: "🎯 Core Breakthrough", prompt: "What is the core breakthrough and primary thesis of this paper?" },
    { label: "🔬 Explain Methodology", prompt: "Explain the technical methodology and experimental setup step-by-step." },
    { label: "📊 Key Quantitative Results", prompt: "What are the key quantitative benchmarks, accuracy numbers, or empirical findings?" },
    { label: "⚠️ Limitations & Assumptions", prompt: "What are the limitations, core assumptions, and open challenges identified?" },
    { label: "💡 Novelty vs Prior Art", prompt: "How does this paper differ from and improve upon prior existing literature?" },
    { label: "🎓 Non-Specialist Overview", prompt: "Explain this paper simply so a graduate student in another field can grasp it quickly." },
  ];

  if (!activePaper) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      
      {/* Main Chat Workspace Container */}
      <div className="w-full max-w-4xl h-[92vh] max-h-[850px] bg-white rounded-2xl shadow-2xl border border-schola-border flex flex-col overflow-hidden relative">
        
        {/* Background Watermark */}
        <div 
          className="absolute inset-0 bg-no-repeat bg-center bg-contain opacity-[0.02] pointer-events-none z-0"
          style={{ backgroundImage: `url('/logo.png')` }}
        />

        {/* Top Header */}
        <div className="h-16 px-4 sm:px-6 border-b border-schola-border bg-schola-panel/90 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
          
          {/* Left: Brand & Active Paper Selector */}
          <div className="flex items-center space-x-3 min-w-0 max-w-[65%] sm:max-w-[75%]">
            <div className="w-9 h-9 rounded-xl bg-schola-arc text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-200" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-sm text-schola-text">
                  ARC Paper Intelligence
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center space-x-1 border ${
                  isOnline 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {isOnline ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                  <span>{isOnline ? 'Gemini Online' : 'Edge NLP Offline'}</span>
                </span>
              </div>

              {/* Dropdown to switch analyzed paper */}
              <div className="relative">
                <button
                  onClick={() => setShowPaperDropdown(!showPaperDropdown)}
                  className="flex items-center space-x-1 text-xs text-schola-muted hover:text-schola-text transition cursor-pointer truncate max-w-full text-left"
                  title="Switch analyzed paper"
                >
                  <span className="truncate font-sans font-medium text-schola-text">
                    {activePaper.title}
                  </span>
                  <ChevronDown className="w-3 h-3 shrink-0" />
                </button>

                {showPaperDropdown && (
                  <div className="absolute left-0 mt-2 w-80 sm:w-96 max-h-60 overflow-y-auto bg-white rounded-xl shadow-xl border border-schola-border p-1.5 z-50 text-xs">
                    <div className="px-2 py-1 text-[11px] font-mono uppercase text-schola-muted border-b border-schola-border mb-1">
                      Select Paper to Interrogate ({availablePapers.length})
                    </div>
                    {availablePapers.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelectPaper(p);
                          setShowPaperDropdown(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg transition truncate cursor-pointer ${
                          p.id === activePaper.id ? 'bg-schola-arcLight text-schola-arc font-semibold' : 'hover:bg-schola-panel text-schola-text'
                        }`}
                      >
                        <p className="truncate font-serif">{p.title}</p>
                        <p className="text-[10px] text-schola-muted truncate">{p.authors.join(', ')} ({p.publicationYear})</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={() => {
                onReadPaper(activePaper);
                onClose();
              }}
              className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-schola-border bg-white hover:bg-schola-subtle text-xs font-medium text-schola-text transition cursor-pointer shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-schola-arc" />
              <span>Read in Reader</span>
            </button>

            <button
              onClick={handleClearChat}
              className="p-2 rounded-lg hover:bg-schola-subtle text-schola-muted hover:text-schola-text transition cursor-pointer"
              title="Clear chat history for this paper"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-schola-subtle text-schola-muted hover:text-schola-text transition cursor-pointer"
              title="Close ARC AI"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs (Chat vs Structured Synthesis) */}
        <div className="h-10 px-4 sm:px-6 border-b border-schola-border bg-schola-panel/50 flex items-center space-x-2 text-xs z-10 shrink-0">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1 rounded-md transition font-medium cursor-pointer ${
              activeTab === 'chat' 
                ? 'bg-white shadow-2xs text-schola-text font-bold border border-schola-border' 
                : 'text-schola-muted hover:text-schola-text'
            }`}
          >
            💬 Interactive Chat
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1 rounded-md transition font-medium cursor-pointer ${
              activeTab === 'summary' 
                ? 'bg-white shadow-2xs text-schola-text font-bold border border-schola-border' 
                : 'text-schola-muted hover:text-schola-text'
            }`}
          >
            📋 Executive Summary & TL;DR
          </button>
          <button
            onClick={() => setActiveTab('methods')}
            className={`px-3 py-1 rounded-md transition font-medium cursor-pointer ${
              activeTab === 'methods' 
                ? 'bg-white shadow-2xs text-schola-text font-bold border border-schola-border' 
                : 'text-schola-muted hover:text-schola-text'
            }`}
          >
            🔬 Methods & Equations
          </button>
          <button
            onClick={() => setActiveTab('limitations')}
            className={`px-3 py-1 rounded-md transition font-medium cursor-pointer ${
              activeTab === 'limitations' 
                ? 'bg-white shadow-2xs text-schola-text font-bold border border-schola-border' 
                : 'text-schola-muted hover:text-schola-text'
            }`}
          >
            ⚠️ Limitations
          </button>
        </div>

        {/* TAB 1: INTERACTIVE CHAT SPACE */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden relative z-10">
            
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg) => {
                const isArc = msg.sender === 'arc';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-3 ${isArc ? '' : 'flex-row-reverse space-x-reverse'}`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isArc ? 'bg-schola-arc text-white shadow-2xs' : 'bg-schola-panel border border-schola-border text-schola-text'
                    }`}>
                      {isArc ? <Sparkles className="w-4 h-4 text-emerald-200" /> : 'You'}
                    </div>

                    {/* Bubble */}
                    <div className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isArc 
                        ? 'bg-[#fbf9f4] border border-[#e8dfcf] text-schola-text shadow-2xs' 
                        : 'bg-schola-arc text-white shadow-xs'
                    }`}>
                      <div className="whitespace-pre-wrap font-sans">
                        {msg.text}
                      </div>

                      <div className={`flex items-center justify-between pt-2 mt-2 border-t text-[10px] ${
                        isArc ? 'border-schola-border/60 text-schola-muted' : 'border-white/20 text-emerald-100'
                      }`}>
                        <span>{msg.timestamp}</span>
                        {isArc && (
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="hover:text-schola-arc transition flex items-center space-x-1 cursor-pointer"
                            title="Copy answer"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center space-x-3 text-xs text-schola-muted animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-schola-arc text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-200 animate-spin" />
                  </div>
                  <div className="bg-schola-panel px-4 py-2.5 rounded-2xl border border-schola-border">
                    ARC is analyzing "{activePaper.title}"...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-4 py-2 border-t border-schola-border bg-schola-panel/50 overflow-x-auto flex items-center space-x-2 shrink-0 no-scrollbar">
              <span className="text-[11px] font-mono text-schola-muted uppercase shrink-0">Prompts:</span>
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.prompt)}
                  disabled={loading}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-schola-arcLight border border-schola-border hover:border-schola-arc/40 text-schola-text transition cursor-pointer shrink-0 shadow-2xs font-sans disabled:opacity-50"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 border-t border-schola-border bg-white shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  placeholder={`Ask ARC anything about "${activePaper.title.slice(0, 45)}..."`}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-schola-bg border border-schola-border text-schola-text placeholder-schola-muted/70 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-schola-arc shadow-2xs"
                />

                <button
                  type="submit"
                  disabled={loading || !inputQuestion.trim()}
                  className="px-4 py-2.5 rounded-xl bg-schola-arc hover:bg-schola-arcHover text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-40"
                >
                  <span>Ask</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB 2: EXECUTIVE SUMMARY & TL;DR */}
        {activeTab === 'summary' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 relative z-10 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-[#fbf8f0] border border-[#e8ddc8] space-y-2">
              <h3 className="font-serif text-sm font-bold text-schola-text flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-schola-arc" />
                <span>Executive Thesis & Motivation</span>
              </h3>
              <p className="font-serif leading-relaxed text-schola-text text-sm">
                {summary?.coreThesis || activePaper.abstract || 'No summary compiled.'}
              </p>
            </div>

            {summary?.tldr && (
              <div className="space-y-2">
                <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-schola-muted">
                  3-Bullet Breakthrough TL;DR
                </h4>
                <div className="space-y-2">
                  {summary.tldr.map((bullet, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white border border-schola-border flex items-start space-x-2.5 shadow-2xs">
                      <span className="w-5 h-5 rounded-full bg-schola-arcLight text-schola-arc font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed font-sans">{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-white border border-schola-border space-y-2">
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-schola-muted">
                Key Empirical Findings
              </h4>
              <p className="leading-relaxed font-serif text-schola-text">
                {summary?.keyFindings || 'Comprehensive experimental findings documented in paper body.'}
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: METHODS & EQUATIONS */}
        {activeTab === 'methods' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 relative z-10 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-white border border-schola-border space-y-3">
              <h3 className="font-serif text-sm font-bold text-schola-text flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-schola-arc" />
                <span>Technical Methodology & Architecture</span>
              </h3>
              <p className="leading-relaxed font-serif text-schola-text">
                {summary?.methodology || 'Methodological protocols defined in study.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-schola-panel border border-schola-border space-y-2">
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-schola-muted">
                Research Metadata
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs pt-1">
                <div>
                  <span className="text-schola-muted block text-[10px]">Year</span>
                  <span>{activePaper.publicationYear}</span>
                </div>
                <div>
                  <span className="text-schola-muted block text-[10px]">Venue</span>
                  <span className="truncate block">{activePaper.venue}</span>
                </div>
                <div>
                  <span className="text-schola-muted block text-[10px]">DOI</span>
                  <span className="truncate block">{activePaper.doi || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LIMITATIONS */}
        {activeTab === 'limitations' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 relative z-10 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
              <h3 className="font-serif text-sm font-bold text-amber-950 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>Identified Limitations & Operational Constraints</span>
              </h3>
              <p className="leading-relaxed font-serif text-amber-900">
                {summary?.limitations || 'Study bounds and constraints detailed in the discussion section.'}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
