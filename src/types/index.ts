export interface Paper {
  id: string;
  doi: string;
  title: string;
  publicationYear: number;
  citedByCount: number;
  authors: string[];
  venue: string;
  type: string;
  volume?: string;
  issue?: string;
  pages?: string;
  pdfUrl?: string;
  landingPageUrl?: string;
  abstract?: string;
  savedLocally?: boolean;
  bookmarked?: boolean;
  downloadedAt?: string;
  fileBlobUrl?: string;
  folderId?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  researchDomain?: string;
}

export interface HistoryEntry {
  id: string;
  paper: Paper;
  readAt: string;
  progressPercent?: number;
}

export interface CustomFolder {
  id: string;
  name: string;
  createdAt: string;
  color?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'arc';
  text: string;
  timestamp: string;
  sectionRef?: string;
}

export interface ResearchDomain {
  id: string;
  name: string;
  icon: string;
  description: string;
  suggestions: { label: string; query: string }[];
}

export const RESEARCH_DOMAINS: ResearchDomain[] = [
  {
    id: "ai-cs",
    name: "AI & Computer Science",
    icon: "💻",
    description: "Machine learning, LLMs, neural architectures, systems & robotics",
    suggestions: [
      { label: "🧠 LLM Multi-Step Reasoning", query: "large language model multi-step reasoning chain of thought" },
      { label: "⚡ Efficient Transformer Inference", query: "efficient sparse attention transformer inference" },
      { label: "👁️ Vision-Language Multimodal Agents", query: "multimodal vision language agent autonomous" },
      { label: "🔒 AI Safety & Interpretability", query: "mechanistic interpretability representation alignment" },
    ]
  },
  {
    id: "biomed",
    name: "Biomedicine & Genomics",
    icon: "🧬",
    description: "Oncology, molecular biology, CRISPR, immunology & metabolomics",
    suggestions: [
      { label: "🔬 Complex II & Cancer Metabolism", query: "succinate dehydrogenase cancer metabolic vulnerability" },
      { label: "✂️ CRISPR-Cas Precise Base Editing", query: "precise base editing therapeutic genetic disease" },
      { label: "💊 Targeted Kinase Inhibitors", query: "targeted kinase inhibitor structural drug discovery" },
      { label: "🧬 Single-Cell Spatial Transcriptomics", query: "spatial transcriptomics tumor microenvironment" },
    ]
  },
  {
    id: "physics",
    name: "Physics & Quantum",
    icon: "⚛️",
    description: "Quantum computing, high-energy physics, condensed matter & cosmology",
    suggestions: [
      { label: "🌌 Quantum Error Correction", query: "surface code quantum error correction fault tolerance" },
      { label: "⚡ High-Tc Superconductivity", query: "unconventional superconductivity nickelate cuprate" },
      { label: "🔭 Gravitational Waves & Black Holes", query: "gravitational wave merger black hole ringdown" },
    ]
  },
  {
    id: "aerospace",
    name: "Aerospace & Mechanical",
    icon: "🚀",
    description: "Propulsion, flight dynamics, digital twins & autonomous aerial swarms",
    suggestions: [
      { label: "🛩️ Physics-Informed Digital Twins", query: "physics-informed digital twin structural health monitoring" },
      { label: "🔥 Rotating Detonation Combustion", query: "rotating detonation engine pressure gain combustion" },
      { label: "🛸 Autonomous UAV Swarm Coordination", query: "decentralized UAV swarm distributed consensus" },
    ]
  },
  {
    id: "materials",
    name: "Materials & Chemistry",
    icon: "🧪",
    description: "Nanomaterials, solid-state batteries, catalysis & synthesis",
    suggestions: [
      { label: "🔋 Solid-State Battery Electrolytes", query: "solid state battery sulfide garnet electrolyte" },
      { label: "☀️ Perovskite Tandem Solar Cells", query: "perovskite silicon tandem photovoltaic stability" },
      { label: "🧪 Metal-Organic Frameworks (MOFs)", query: "metal organic framework carbon capture catalysis" },
    ]
  },
  {
    id: "econ",
    name: "Economics & Quantitative Finance",
    icon: "📊",
    description: "Econometrics, algorithmic game theory, macro modeling & behavioral economics",
    suggestions: [
      { label: "📈 Machine Learning in Macro Forecasting", query: "machine learning high dimensional macroeconomic forecasting" },
      { label: "🎲 Algorithmic Game Theory & Markets", query: "algorithmic game theory automated mechanism design" },
      { label: "🌍 Climate Economics & Carbon Pricing", query: "optimal carbon tax integrated assessment climate" },
    ]
  },
  {
    id: "general",
    name: "General Multidisciplinary",
    icon: "🌐",
    description: "Cross-disciplinary scientific literature and emerging discoveries",
    suggestions: [
      { label: "🤖 Frontier Artificial Intelligence", query: "frontier artificial intelligence scientific discovery" },
      { label: "🌿 Clean Energy Transition & Decarbonization", query: "renewable energy grid storage decarbonization" },
      { label: "🦠 Pathogen Surveillance & mRNA Platforms", query: "mRNA vaccine platform viral surveillance" },
    ]
  }
];

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
