import JSZip from "jszip";
import type { Paper } from "../types";

/**
 * Sanitizes filename for cross-platform compatibility (Windows, Android, Linux, macOS)
 */
export function sanitizeName(name: string, maxLen: number = 80): string {
  return name
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen)
    .trim() || "Paper";
}

/**
 * Builds CSV string formatted for reference managers and PRISMA systematic reviews
 */
export function generatePaperListCsv(papers: Paper[]): string {
  const headers = ["No", "Title", "Authors", "Year", "Venue", "Citations", "DOI", "Type", "PDF_URL"];
  const rows = papers.map((p, idx) => [
    (idx + 1).toString(),
    `"${(p.title || "").replace(/"/g, '""')}"`,
    `"${(p.authors.join(", ") || "").replace(/"/g, '""')}"`,
    p.publicationYear.toString(),
    `"${(p.venue || "").replace(/"/g, '""')}"`,
    p.citedByCount.toString(),
    `"${p.doi || ""}"`,
    `"${p.type || "article"}"`,
    `"${p.pdfUrl || ""}"`,
  ]);

  return [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
}

/**
 * Fetches PDF blob through direct fetch or proxy
 */
export async function fetchPdfBlob(url: string): Promise<Blob | null> {
  // Try direct fetch first
  try {
    const res = await fetch(url, { headers: { "Accept": "application/pdf,*/*" } });
    if (res.ok) {
      const blob = await res.blob();
      if (blob.size > 20000) return blob;
    }
  } catch {}

  // Fallback to CORS proxy if browser blocks cross-origin PDF
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  ];

  for (const proxyUrl of proxies) {
    try {
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const blob = await res.blob();
        if (blob.size > 20000) return blob;
      }
    } catch {}
  }

  return null;
}

/**
 * Records a downloaded paper into local storage so it appears unzipped in Downloads & Shelf
 */
export function recordDownloadedPaper(paper: Paper, blobUrl?: string): void {
  try {
    const raw = localStorage.getItem("theschola_downloads") || "[]";
    const existing: Paper[] = JSON.parse(raw);
    const updatedPaper: Paper = {
      ...paper,
      savedLocally: true,
      downloadedAt: new Date().toISOString(),
      fileBlobUrl: blobUrl || paper.pdfUrl,
    };
    
    // Avoid duplicates
    const filtered = existing.filter(p => p.id !== paper.id);
    const newList = [updatedPaper, ...filtered];
    localStorage.setItem("theschola_downloads", JSON.stringify(newList));

    // Also sync to shelf so it's unzipped and accessible in shelf
    const shelfRaw = localStorage.getItem("theschola_shelf") || "[]";
    const shelf: Paper[] = JSON.parse(shelfRaw);
    if (!shelf.some(p => p.id === paper.id)) {
      localStorage.setItem("theschola_shelf", JSON.stringify([updatedPaper, ...shelf]));
    }
    
    window.dispatchEvent(new Event("scholapulse_storage_updated"));
  } catch (err) {
    console.error("Failed to record downloaded paper:", err);
  }
}

/**
 * Records a batch of papers into local storage as individual unzipped readable entries
 */
export function recordBatchDownloadedPapers(papers: Paper[]): void {
  try {
    const raw = localStorage.getItem("theschola_downloads") || "[]";
    const existing: Paper[] = JSON.parse(raw);
    const shelfRaw = localStorage.getItem("theschola_shelf") || "[]";
    const shelf: Paper[] = JSON.parse(shelfRaw);

    const now = new Date().toISOString();
    const updatedPapers = papers.map(p => ({
      ...p,
      savedLocally: true,
      downloadedAt: now,
    }));

    // Merge into downloads
    const existingIds = new Set(existing.map(p => p.id));
    const newDownloads = [...updatedPapers.filter(p => !existingIds.has(p.id)), ...existing];
    localStorage.setItem("theschola_downloads", JSON.stringify(newDownloads));

    // Merge unzipped papers into shelf
    const shelfIds = new Set(shelf.map(p => p.id));
    const newShelf = [...updatedPapers.filter(p => !shelfIds.has(p.id)), ...shelf];
    localStorage.setItem("theschola_shelf", JSON.stringify(newShelf));

    window.dispatchEvent(new Event("scholapulse_storage_updated"));
  } catch (err) {
    console.error("Failed to record batch downloaded papers:", err);
  }
}

/**
 * Saves a single paper directly to browser Downloads with smart status reporting
 */
export async function downloadSinglePaper(
  paper: Paper, 
  index: number = 1,
  onStatus?: (status: 'fetching' | 'saving' | 'success' | 'redirected' | 'error', message: string) => void
): Promise<boolean> {
  const targetUrl = paper.pdfUrl || paper.landingPageUrl;
  if (!targetUrl) {
    onStatus?.('error', 'No open-access link available for this document.');
    return false;
  }
  
  onStatus?.('fetching', 'Locating and fetching PDF stream...');
  
  if (paper.pdfUrl) {
    const blob = await fetchPdfBlob(paper.pdfUrl);
    if (blob) {
      onStatus?.('saving', 'Saving PDF to device and Shelf...');
      const filename = `${String(index).padStart(3, "0")} ${paper.publicationYear} ${sanitizeName(paper.title)}.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      recordDownloadedPaper(paper, url);
      onStatus?.('success', 'Saved to Downloads & Shelf!');
      return true;
    }
  }

  // If blob fetch is blocked by CORS/paywall, open publisher portal
  onStatus?.('redirected', 'Direct PDF stream restricted. Opening official publisher portal...');
  window.open(targetUrl, "_blank");
  recordDownloadedPaper(paper);
  onStatus?.('success', 'Recorded in Downloads & Shelf!');
  return true;
}

/**
 * Native File System Access API: Saves papers directly into a user-selected folder on laptop
 */
export async function saveToDirectoryHandle(
  dirHandle: any,
  topic: string,
  papers: Paper[],
  onProgress?: (index: number, total: number, title: string) => void
): Promise<number> {
  const folderName = sanitizeName(topic, 50);
  // Create or get subfolder for topic
  const subDir = await dirHandle.getDirectoryHandle(folderName, { create: true });
  
  let savedCount = 0;
  const successfullyDownloaded: Paper[] = [];

  for (let i = 0; i < papers.length; i++) {
    const paper = papers[i];
    if (!paper.pdfUrl) continue;

    onProgress?.(i + 1, papers.length, paper.title);

    const blob = await fetchPdfBlob(paper.pdfUrl);
    if (blob) {
      const fileName = `${String(savedCount + 1).padStart(3, "0")} ${paper.publicationYear} ${sanitizeName(paper.title)}.pdf`;
      const fileHandle = await subDir.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      savedCount++;
      successfullyDownloaded.push(paper);
    }
  }

  // Write Paper List.csv and record into in-app shelf & downloads
  if (successfullyDownloaded.length > 0) {
    recordBatchDownloadedPapers(successfullyDownloaded);
    const csvContent = generatePaperListCsv(successfullyDownloaded);
    const csvHandle = await subDir.getFileHandle("Paper List.csv", { create: true });
    const writable = await csvHandle.createWritable();
    await writable.write(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }));
    await writable.close();
  }

  return savedCount;
}

/**
 * Generates an organized ZIP file containing all PDFs and Paper List.csv (ideal for mobile)
 */
export async function downloadBulkAsZip(
  topic: string,
  papers: Paper[],
  onProgress?: (current: number, total: number, name: string) => void
): Promise<void> {
  const zip = new JSZip();
  const folderName = sanitizeName(topic, 50);
  const folder = zip.folder(folderName) || zip;

  const validPapers: Paper[] = [];
  let downloaded = 0;

  for (let i = 0; i < papers.length; i++) {
    const paper = papers[i];
    if (!paper.pdfUrl) continue;

    onProgress?.(i + 1, papers.length, paper.title);

    const blob = await fetchPdfBlob(paper.pdfUrl);
    if (blob) {
      downloaded++;
      const fileName = `${String(downloaded).padStart(3, "0")} ${paper.publicationYear} ${sanitizeName(paper.title)}.pdf`;
      folder.file(fileName, blob);
      validPapers.push(paper);
    }
  }

  if (validPapers.length > 0) {
    // Record all unzipped individual papers directly into in-app shelf and downloads
    recordBatchDownloadedPapers(validPapers);
    const csvData = generatePaperListCsv(validPapers);
    folder.file("Paper List.csv", csvData);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${folderName}_Papers.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
