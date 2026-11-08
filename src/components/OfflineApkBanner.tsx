import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  WifiOff, 
  ShieldCheck, 
  CheckCircle2, 
  Layers,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import { downloadLatestApkFromGitHub } from '../services/apkService';

export const OfflineApkBanner: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  const handleDownloadApk = async () => {
    setDownloading(true);
    try {
      await downloadLatestApkFromGitHub("Sm-bello", "PaperPulse");
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (e) {
      console.error("APK download error:", e);
    } finally {
      setDownloading(false);
    }
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
        <div className="space-y-3 max-w-2xl text-center lg:text-left">
          
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
            Conducting experiments in shielded labs, flight cabins, or remote field sites with zero connectivity? Install ScholaPulse directly on your Android phone. Read full PDFs, keep organized topic folders, and generate deep executive summaries with the embedded <strong>offline Edge NLP engine</strong>.
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
            disabled={downloading}
            className="w-full flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-schola-arc hover:bg-schola-arcHover text-white font-semibold text-xs sm:text-sm shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-75"
          >
            {downloading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                <span>Checking GitHub Release...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Shipping Latest APK...</span>
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
            <span>GitHub Latest Release · Verified APK</span>
          </div>

        </div>

      </div>

      {/* Expandable Android Installation Guide */}
      {showInstallGuide && (
        <div className="mt-5 pt-5 border-t border-schola-border grid grid-cols-1 md:grid-cols-3 gap-3 text-xs animate-in fade-in duration-200">
          <div className="p-3 rounded-xl bg-schola-panel border border-schola-border">
            <span className="font-mono text-schola-arc font-bold block mb-1">Step 1 · Download</span>
            <p className="text-schola-text">
              Tap <strong>Download Android APK</strong>. The file will save directly into your phone's Downloads directory.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-schola-panel border border-schola-border">
            <span className="font-mono text-schola-arc font-bold block mb-1">Step 2 · Allow Install</span>
            <p className="text-schola-text">
              Tap the downloaded file. When prompted by Android, select <em>"Allow from this source"</em> to approve installation.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-schola-panel border border-schola-border">
            <span className="font-mono text-schola-arc font-bold block mb-1">Step 3 · Offline Research</span>
            <p className="text-schola-text">
              Open ScholaPulse. Read papers, download collections, and generate edge AI summaries with zero reception.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
