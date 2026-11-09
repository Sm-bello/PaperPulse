import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  Sparkles, 
  Layers, 
  HardDrive, 
  Smartphone, 
  CheckCircle2, 
  FileText,
  ShieldCheck,
  Search,
  ZoomIn
} from 'lucide-react';

interface TutorialGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const TutorialGuideModal: React.FC<TutorialGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Welcome to THE SCHOLA",
      subtitle: "Your intelligent research environment & multi-format reading hub",
      icon: BookOpen,
      badge: "Overview",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-schola-text leading-relaxed">
          <p>
            <strong>THE SCHOLA</strong> (PaperPulse) is an academic workspace crafted for researchers, engineers, and scholars. It unifies global literature discovery, an in-app multi-format reading center, auto-unzipped local libraries, and <strong>ARC AI</strong> research synthesis.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <div className="p-3 rounded-xl bg-schola-subtle border border-schola-border">
              <span className="font-semibold text-schola-text block mb-1 flex items-center space-x-1.5">
                <Search className="w-3.5 h-3.5 text-schola-arc" />
                <span>200M+ Academic Papers</span>
              </span>
              <p className="text-[11px] text-schola-muted">
                Harvest from arXiv, PubMed, Nature, and OpenAlex with curated research pillars tailored to your discipline.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-schola-subtle border border-schola-border">
              <span className="font-semibold text-schola-text block mb-1 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-schola-arc" />
                <span>ARC AI Research Copilot</span>
              </span>
              <p className="text-[11px] text-schola-muted">
                Deconstruct methodologies, extract equations, and interrogate findings online (Gemini) or offline (Edge NLP).
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "1. Literature Harvesting & Domain Pillars",
      subtitle: "Personalized search adapted to your exact research field",
      icon: Layers,
      badge: "Harvest",
      badgeColor: "bg-sky-100 text-sky-800 border-sky-300",
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm text-schola-text leading-relaxed">
          <p>
            When you sign in with Google or explore, THE SCHOLA prompts you for your primary domain (AI, Biomedicine, Physics, Aerospace, Materials, or Economics).
          </p>
          <ul className="space-y-2 text-xs">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-schola-arc shrink-0 mt-0.5" />
              <span><strong>Clean Empty Search:</strong> Start typing any paper topic, author, or DOI without cluttered preset queries.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-schola-arc shrink-0 mt-0.5" />
              <span><strong>Dynamic Pillar Chips:</strong> Tap any curated research pillar beneath the search bar to run instant high-impact queries.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-schola-arc shrink-0 mt-0.5" />
              <span><strong>Change Field Anytime:</strong> Tap the discipline badge beside <em>Pillars</em> to seamlessly switch domains.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "2. In-App Reading Center (No External Redirects)",
      subtitle: "Stable page navigation, zoom controls, and multi-format support",
      icon: FileText,
      badge: "Reading Engine",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm text-schola-text leading-relaxed">
          <p>
            Click <strong>Read Paper</strong> on any card to enter the reading workspace without being kicked to external browser tabs.
          </p>
          <div className="p-3.5 rounded-xl bg-schola-panel border border-schola-border space-y-2">
            <div className="flex items-center space-x-2 font-semibold text-xs">
              <ZoomIn className="w-4 h-4 text-schola-arc" />
              <span>Navigation & View Controls:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-schola-muted">
              <li><strong>Page Navigation:</strong> Use <strong>Next Page</strong> / <strong>Previous Page</strong> arrows or page selector to advance through the paper sections.</li>
              <li><strong>Zoom Controls:</strong> Scale the page from <strong>50% to 200%</strong> with smooth typography and layout stability.</li>
              <li><strong>Reading Themes:</strong> Switch between <strong>Light Academic</strong>, <strong>Sepia Eye-Care</strong>, and <strong>Night Mode</strong>.</li>
              <li><strong>Format Engine:</strong> Read PDFs, Markdown (<code>.md</code>), Word (<code>.docx</code>), BibTeX, and Python scripts.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "3. Auto-Unzipped Shelf & Downloads",
      subtitle: "Instant offline access to papers without manual extraction",
      icon: HardDrive,
      badge: "Storage & Shelf",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm text-schola-text leading-relaxed">
          <p>
            Downloading research should be effortless. We designed smart downloading that handles everything:
          </p>
          <ul className="space-y-2 text-xs">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Smart Real-Time Feedback:</strong> The download button updates live (<em>Locating stream...</em> &rarr; <em>Saving...</em> &rarr; <em>Saved!</em>).</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Auto-Unzipped Shelf Access:</strong> Downloading a batch ZIP automatically indexes every paper as an individual, unzipped entry in your <strong>Downloads & History</strong> tab and <strong>My Shelf</strong>.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Custom Folders:</strong> Create custom research collections with the <code>+ New Folder</code> button in the sidebar.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "4. ARC AI Research Chat Copilot",
      subtitle: "Interrogate any paper with multi-turn scientific Q&A",
      icon: Sparkles,
      badge: "ARC AI",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm text-schola-text leading-relaxed">
          <p>
            Click the <strong>ARC AI</strong> button in the top navigation at any time to open the dedicated conversational research space:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
              <p className="font-semibold text-emerald-950 mb-1">Online Mode</p>
              <p className="text-[11px] text-emerald-900 leading-normal">
                Powered by Gemini 2.5 Flash for deep synthesis, mathematical derivation, and contextual cross-referencing.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200">
              <p className="font-semibold text-amber-950 mb-1">Offline Edge NLP</p>
              <p className="text-[11px] text-amber-900 leading-normal">
                Zero-bandwidth heuristic engine extracts findings, methods, and limitations completely on-device when disconnected.
              </p>
            </div>
          </div>
          <p className="text-[11px] text-schola-muted">
            Tip: Click pre-built prompt chips like <em>"Break down methodology"</em> or <em>"Explain equations"</em> to get instant structured responses.
          </p>
        </div>
      ),
    },
    {
      title: "5. Android Companion & Play Protect Sideloading",
      subtitle: "How to safely install and run the APK on any Android phone",
      icon: Smartphone,
      badge: "Mobile Companion",
      badgeColor: "bg-stone-100 text-stone-800 border-stone-300",
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm text-schola-text leading-relaxed">
          <p>
            ScholaPulse v2.0 is signed with Android SDK <strong>APK Signature Schemes v1, v2, and v3</strong> with 4-byte zip alignment, making it universally compatible with Android 8 through 16.
          </p>
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-2">
            <div className="flex items-center space-x-1.5 font-semibold text-xs text-amber-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Google Play Protect Sideload Step:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Because the APK is distributed directly outside the Google Play Store, Android displays a standard unrecognized developer dialog:
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] font-medium">
              <li>When the Play Protect dialog appears, tap <strong>"More details"</strong>.</li>
              <li>Tap <strong>"Install anyway"</strong>.</li>
              <li>The app opens immediately with full offline capabilities!</li>
            </ol>
            <p className="text-[10px] text-amber-800 italic pt-1">
              Note: ScholaPulse requires only standard internet permissions — zero tracking, zero malware, 100% open-source.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];
  const StepIcon = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('theschola_tutorial_completed', 'true');
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-schola-border overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-schola-border bg-schola-panel flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-schola-border flex items-center justify-center p-0.5 shadow-2xs">
              <img src="/logo.png" alt="THE SCHOLA" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-serif font-bold text-sm tracking-wider uppercase text-schola-text block">
                Platform Tour
              </span>
              <span className="text-[11px] text-schola-muted">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.setItem('theschola_tutorial_completed', 'true');
              onClose();
            }}
            className="p-1.5 rounded-lg text-schola-muted hover:text-schola-text hover:bg-schola-subtle transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Step Badge & Icon */}
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-schola-arcLight text-schola-arc flex items-center justify-center shrink-0 border border-schola-arc/20">
              <StepIcon className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${current.badgeColor}`}>
                {current.badge}
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-schola-text mt-1 leading-snug">
                {current.title}
              </h2>
            </div>
          </div>

          <p className="text-xs font-mono text-schola-muted pb-1 border-b border-schola-border/60">
            {current.subtitle}
          </p>

          {/* Dynamic Content */}
          <div className="pt-1">
            {current.content}
          </div>

        </div>

        {/* Footer Navigation */}
        <div className="px-5 py-3.5 border-t border-schola-border bg-schola-panel flex items-center justify-between">
          
          {/* Step Dots */}
          <div className="flex items-center space-x-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  idx === currentStep 
                    ? 'w-6 bg-schola-arc' 
                    : 'bg-schola-border hover:bg-schola-muted'
                }`}
                title={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Next / Previous Buttons */}
          <div className="flex items-center space-x-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-schola-border bg-white hover:bg-schola-subtle text-xs font-medium text-schola-text transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}

            {onNavigateToTab && currentStep === steps.length - 1 && (
              <button
                onClick={() => {
                  localStorage.setItem('theschola_tutorial_completed', 'true');
                  onNavigateToTab('Harvest');
                }}
                className="px-3 py-1.5 rounded-xl border border-schola-arc/30 bg-schola-arcLight text-schola-arc text-xs font-semibold hover:bg-schola-arc hover:text-white transition cursor-pointer"
              >
                Explore Harvest
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center space-x-1 px-4 py-1.5 rounded-xl bg-schola-arc hover:bg-schola-arcHover text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <span>{currentStep === steps.length - 1 ? "Finish Tour" : "Next Step"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
