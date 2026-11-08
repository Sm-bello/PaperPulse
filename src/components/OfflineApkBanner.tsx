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

interface OfflineApkBannerProps {
  onDismiss?: () => void;
}

export const OfflineApkBanner: React.FC<OfflineApkBannerProps> = () => {
  const [downloadTriggered, setDownloadTriggered] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  const handleDownloadApk = () => {
    setDownloadTriggered(true);
    // Link to direct APK download or GitHub Actions artifact
    const a = document.createElement('a');
    a.href = 'https://github.com/Sm-bello/PaperPulse/releases/latest/download/PaperPulse.apk';
    a.setAttribute('download', 'PaperPulse-v2.0.apk');
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => setDownloadTriggered(false), 3000);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950/40 to-indigo-950/40 border border-sky-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      
      {/* Decorative Glow Blobs */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
        
        {/* Left Column: Details */}
        <div className="space-y-4 max-w-2xl text-center lg:text-left">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-900/60 border border-sky-700/60 text-sky-300 text-xs font-mono">
            <Smartphone className="w-3.5 h-3.5 text-sky-400" />
            <span>Mobile Research Companion · Android APK & PWA</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Take Your Research Anywhere — <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300">
              Download the APK for 100% Offline Reading
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            In flight cabins, isolated labs, or off-grid field sites with zero internet? Install the PaperPulse mobile app on your Android device. Read saved papers, download full PDF collections, and generate deep executive summaries with the embedded <strong>Edge NLP offline engine</strong>.
          </p>

          {/* Value Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center space-x-2 text-sky-400 mb-1">
                <WifiOff className="w-4 h-4" />
                <span className="text-xs font-semibold text-slate-200">Zero Internet Needed</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Built-in heuristic NLP summarizes papers on-device with zero data usage.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center space-x-2 text-indigo-400 mb-1">
                <Layers className="w-4 h-4" />
                <span className="text-xs font-semibold text-slate-200">Direct Phone Storage</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Saves papers automatically into organized folders in your mobile files.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center space-x-2 text-emerald-400 mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs font-semibold text-slate-200">Eye-Care Reader</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Sepia & night mode inverted filters tuned for dark environment reading.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Download Card & Actions */}
        <div className="flex flex-col items-center justify-center space-y-3 w-full lg:w-auto min-w-[260px]">
          
          <button
            onClick={handleDownloadApk}
            className="w-full flex items-center justify-center space-x-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-sky-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            {downloadTriggered ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <span>Downloading APK...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Download Android APK</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowInstallGuide(!showInstallGuide)}
            className="text-xs text-sky-400 hover:text-sky-300 font-medium underline underline-offset-4 cursor-pointer"
          >
            {showInstallGuide ? "Hide Installation Steps" : "How to install on Android?"}
          </button>

          <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Capacitor Native · Verified Safe APK</span>
          </div>

        </div>

      </div>

      {/* Expandable Android Installation Guide */}
      {showInstallGuide && (
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-in fade-in duration-200">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="font-mono text-sky-400 font-bold block mb-1">Step 1 · Download</span>
            <p className="text-slate-300">
              Click <strong>Download Android APK</strong> on your phone. The file <code className="text-sky-300">PaperPulse-v2.0.apk</code> will save to your Downloads folder.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="font-mono text-sky-400 font-bold block mb-1">Step 2 · Allow Install</span>
            <p className="text-slate-300">
              Open the downloaded file. If prompted, toggle <em>"Allow installation from this source"</em> in your Android settings.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="font-mono text-emerald-400 font-bold block mb-1">Step 3 · Offline Research</span>
            <p className="text-slate-300">
              Launch PaperPulse. Sign in once or use offline mode. You can now read and summarize anywhere with zero reception.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
