export interface Paper {
  id: string;
  doi: string;
  title: string;
  publicationYear: number;
  citedByCount: number;
  authors: string[];
  venue: string;
  type: string;
  pdfUrl?: string;
  landingPageUrl?: string;
  abstract?: string;
  savedLocally?: boolean;
  bookmarked?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AISummary {
  paperId: string;
  paperTitle: string;
  tldr: string[];
  coreThesis: string;
  methodology: string;
  keyFindings: string;
  limitations: string;
  mode: 'online' | 'offline';
  generatedAt: string;
}

export interface HarvestJob {
  running: boolean;
  stop: boolean;
  done: number;
  target: number;
  checked: number;
  topic: string;
  fromYear: number;
  peerOnly: boolean;
  logs: { time: string; msg: string; kind: 'info' | 'ok' | 'warn' | 'error' }[];
  currentFolder?: string;
  downloadedPapers: Paper[];
}
