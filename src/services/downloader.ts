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
 * Saves a single paper directly to browser Downloads
 */
export async function downloadSinglePaper(paper: Paper, index: number = 1): Promise<boolean> {
  if (!paper.pdfUrl) return false;
  
  const blob = await fetchPdfBlob(paper.pdfUrl);
  if (!blob) {
    // If blocked, open PDF link in a new tab so user can download directly
    window.open(paper.pdfUrl, "_blank");
    return true;
  }

  const filename = `${String(index).padStart(3, "0")} ${paper.publicationYear} ${sanitizeName(paper.title)}.pdf`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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

  // Write Paper List.csv
  if (successfullyDownloaded.length > 0) {
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
