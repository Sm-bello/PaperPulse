import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  WifiOff, 
  ShieldCheck, 
  CheckCircle2, 
  Layers,
  BookOpen
} from 'lucide-react';

export const OfflineApkBanner: React.FC = () => {
  const [downloadTriggered, setDownloadTriggered] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  const handleDownloadApk = () => {
    setDownloadTriggered(true);
    const a = document.createElement('a');
    a.href = '/PaperPulse.apk';
    a.setAttribute('download', 'PaperPulse-v2.0.apk');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => setDownloadTriggered(false), 3000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-schola-border p-6 sm:p-7 shadow-xs">
      
      {/* Background Watermark of THE SCHOLA */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-right bg-contain opacity-[0.038] pointer-events-none"
        style={{ backgroundImage: `url('/logo.png')` }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
        
        {/* Left Column: Details */}
        <div className="space-y-3.5 max-w-2xl text-center lg:text-left">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-schola-arcLight border border-schola-arc/20 text-schola-arc text-xs font-mono font-medium">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Research Companion · Android APK & Offline Hub</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-schola-text">
            Take Your Research Anywhere — <br className="hidden sm:inline" />
            <span className="text-schola-arc">
              Download the APK for 100% Offline Reading
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-schola-muted leading-relaxed font-sans">
            Conducting experiments in shielded labs, flight cabins, or remote field sites with zero connectivity? Install PaperPulse directly on your Android phone. Read full PDFs, keep organized topic folders, and generate deep executive summaries with the embedded <strong>offline Edge NLP engine</strong>.
          </p>

          {/* Highlights Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-left">
            <div className="p-3 rounded-xl bg-schola-bg border border-schola-border">
              <div className="flex items-center space-x-1.5 text-schola-arc mb-1">
                <WifiOff className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold text-schola-text">Zero Network Needed</span>
              </div>
              <p className="text-[11px] text-schola-muted">
                Edge NLP synthesizes abstracts and findings on-device with zero data usage.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-schola-bg border border-schola-border">
              <div className="flex items-center space-x-1.5 text-schola-accent mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold text-schola-text">Local Storage</span>
              </div>
              <p className="text-[11px] text-schola-muted">
                Stores your harvested PDF library directly inside your phone's file system.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-schola-bg border border-schola-border">
              <div className="flex items-center space-x-1.5 text-emerald-800 mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold text-schola-text">Eye-Care Reader</span>
              </div>
              <p className="text-[11px] text-schola-muted">
                Sepia and night-inverted modes optimized for long reading sessions.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Download Card & Actions */}
        <div className="flex flex-col items-center justify-center space-y-3 w-full lg:w-auto min-w-[240px] shrink-0">
          
          <button
            onClick={handleDownloadApk}
            className="w-full flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-schola-arc hover:bg-schola-arcHover text-white font-semibold text-xs sm:text-sm shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            {downloadTriggered ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Downloading APK...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Android APK</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowInstallGuide(!showInstallGuide)}
            className="text-xs text-schola-arc hover:underline font-medium cursor-pointer"
          >
            {showInstallGuide ? "Hide instructions" : "How to install on Android?"}
          </button>

          <div className="flex items-center space-x-1.5 text-[11px] text-schola-lightMuted font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-schola-arc" />
            <span>Capacitor Native · Verified Safe APK</span>
          </div>

        </div>

      </div>

      {/* Expandable Android Installation Guide */}
      {showInstallGuide && (
        <div className="mt-5 pt-5 border-t border-schola-border grid grid-cols-1 md:grid-cols-3 gap-3 text-xs animate-in fade-in duration-200">
          <div className="p-3 rounded-xl bg-schola-panel border border-schola-border">
            <span className="font-mono text-schola-arc font-bold block mb-1">Step 1 · Download</span>
            <p className="text-schola-text">
              Tap <strong>Download Android APK</strong>. The package <code className="text-schola-arc">PaperPulse-v2.0.apk</code> will save to your Downloads folder.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-schola-panel border border-schola-border">
            <span className="font-mono text-schola-arc font-bold block mb-1">Step 2 · Allow Install</span>
            <p className="text-schola-text">
              Open the downloaded file. When prompted, select <em>"Allow from this source"</em> in your Android settings.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-schola-panel border border-schola-border">
            <span className="font-mono text-schola-arc font-bold block mb-1">Step 3 · Offline Research</span>
            <p className="text-schola-text">
              Launch PaperPulse. Read papers, save references, and run edge AI summaries with zero internet connection.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
