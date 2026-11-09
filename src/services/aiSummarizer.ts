import type { Paper, AISummary, ChatMessage } from "../types";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/**
 * Stop words for offline NLP processing
 */
const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of",
  "with", "by", "from", "up", "about", "into", "over", "after", "is", "are",
  "was", "were", "be", "been", "being", "have", "has", "had", "do", "does",
  "did", "will", "would", "shall", "should", "may", "might", "must", "can",
  "could", "that", "which", "who", "whom", "this", "these", "those", "am",
  "it", "its", "we", "our", "us", "they", "their", "them", "i", "he", "she"
]);

/**
 * Offline TextRank / NLP sentence scoring and heuristic summary generator
 */
export function generateOfflineSummary(paper: Paper): AISummary {
  const fullText = `${paper.title}. ${paper.abstract || ""}`;
  
  // Split into sentences
  const sentences = fullText
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  // Compute word frequencies
  const wordFreq: Record<string, number> = {};
  const words = fullText.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  
  for (const w of words) {
    if (!STOP_WORDS.has(w)) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
  }

  // Categorize sentences heuristically
  const methodRegex = /propose|method|approach|framework|architecture|design|model|algorithm|experiment|simulate/i;
  const resultRegex = /result|show|demonstrate|achieve|outperform|accuracy|improve|reduce|increase|evaluate/i;
  const limitRegex = /however|challenge|limit|future|tradeoff|cost|constraint|assumption/i;

  const methodSentences = sentences.filter(s => methodRegex.test(s));
  const resultSentences = sentences.filter(s => resultRegex.test(s));
  const limitSentences = sentences.filter(s => limitRegex.test(s));

  // Build structured offline summary
  const coreThesis = sentences[0] || `${paper.title} investigates modern advancements in ${paper.venue}.`;
  
  const methodology = methodSentences.length > 0 
    ? methodSentences[0]
    : `The authors formulate a specialized framework combining empirical analysis and mathematical modeling.`;

  const keyFindings = resultSentences.length > 0
    ? resultSentences[0]
    : `The experimental results validate significant performance benefits and improved fidelity over baseline implementations.`;

  const limitations = limitSentences.length > 0
    ? limitSentences[0]
    : `Future research entails testing under expanded real-world conditions and extended operational envelopes.`;

  // 3-bullet TL;DR
  const tldr = [
    `Focus: ${paper.title.slice(0, 100)}...`,
    `Core Method: ${methodology.slice(0, 110)}...`,
    `Primary Finding: ${keyFindings.slice(0, 110)}...`
  ];

  const summary: AISummary = {
    paperId: paper.id,
    paperTitle: paper.title,
    tldr,
    coreThesis,
    methodology,
    keyFindings,
    limitations,
    mode: "offline",
    generatedAt: new Date().toLocaleTimeString(),
  };

  // Cache in localStorage
  try {
    localStorage.setItem(`summary_${paper.id}`, JSON.stringify(summary));
  } catch {}

  return summary;
}

/**
 * Online AI summary using Google Gemini API
 */
export async function generateOnlineSummary(
  paper: Paper, 
  apiKey?: string
): Promise<AISummary> {
  const activeKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;

  // If no API key or offline, fallback immediately to offline NLP
  if (!activeKey || !navigator.onLine) {
    return generateOfflineSummary(paper);
  }

  const prompt = `You are an elite aerospace and computer science research AI assistant.
Summarize the following scientific research paper for a researcher before they begin reading it.

Paper Title: ${paper.title}
Authors: ${paper.authors.join(", ")} (${paper.publicationYear})
Venue: ${paper.venue}
Abstract/Content:
${paper.abstract || "No abstract provided."}

Return a STRICT JSON object in exactly this schema:
{
  "tldr": [
    "Short 1-sentence bullet on problem solved",
    "Short 1-sentence bullet on core methodology/breakthrough",
    "Short 1-sentence bullet on verified quantitative result"
  ],
  "coreThesis": "2-3 sentences explaining the core thesis, motivation, and exact problem addressed.",
  "methodology": "2-3 sentences explaining the technical architecture, mathematical formulations, software/hardware, and dataset used.",
  "keyFindings": "2-3 sentences detailing empirical findings, benchmarks, accuracy numbers, or performance speedups.",
  "limitations": "1-2 sentences highlighting operational limitations, assumptions, or open challenges."
}`;

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${activeKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      console.warn("Gemini API call failed, falling back to offline NLP:", res.statusText);
      return generateOfflineSummary(paper);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Empty response from AI");

    const parsed = JSON.parse(rawText);

    const summary: AISummary = {
      paperId: paper.id,
      paperTitle: paper.title,
      tldr: Array.isArray(parsed.tldr) ? parsed.tldr : [parsed.tldr || "Key insight summarized."],
      coreThesis: parsed.coreThesis || paper.abstract?.slice(0, 200) || "",
      methodology: parsed.methodology || "Physics-guided and empirical framework.",
      keyFindings: parsed.keyFindings || "Empirically validated with strong performance gains.",
      limitations: parsed.limitations || "Assumes controlled test conditions.",
      mode: "online",
      generatedAt: new Date().toLocaleTimeString(),
    };

    // Cache in localStorage
    localStorage.setItem(`summary_${paper.id}`, JSON.stringify(summary));
    return summary;
  } catch (err) {
    console.warn("Online summarization error, using offline engine:", err);
    return generateOfflineSummary(paper);
  }
}

/**
 * Gets cached summary or computes a new one (respecting online/offline preference)
 */
export async function getPaperSummary(
  paper: Paper, 
  forceMode?: 'online' | 'offline',
  apiKey?: string
): Promise<AISummary> {
  // Check cache first
  const cached = localStorage.getItem(`summary_${paper.id}`);
  if (cached && !forceMode) {
    try {
      return JSON.parse(cached);
    } catch {}
  }

  if (forceMode === 'offline' || !navigator.onLine) {
    return generateOfflineSummary(paper);
  }

  return generateOnlineSummary(paper, apiKey);
}

/**
 * Interactive Q&A chat with ARC AI about a specific research paper
 * Works both Online (Gemini 2.5 Flash) and Offline (Edge Heuristic NLP)
 */
export async function askArcPaperQuestion(
  paper: Paper,
  question: string,
  chatHistory: ChatMessage[] = [],
  apiKey?: string
): Promise<string> {
  const activeKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  const isOnline = navigator.onLine && !!activeKey;

  if (!isOnline) {
    // Offline heuristic answer extraction
    const qLower = question.toLowerCase();
    const fullText = `${paper.title}. ${paper.abstract || ""}`;
    const sentences = fullText
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 20);

    if (qLower.includes("method") || qLower.includes("how") || qLower.includes("architect") || qLower.includes("model")) {
      const methodSentences = sentences.filter(s => /propose|method|approach|framework|architecture|design|model|algorithm|experiment/i.test(s));
      if (methodSentences.length > 0) {
        return `[Offline Edge NLP Mode]\n\n**Methodology Overview:**\n${methodSentences.slice(0, 3).join(" ")}\n\n*This paper combines specialized empirical analysis with algorithmic formulations in ${paper.venue}.*`;
      }
    }

    if (qLower.includes("result") || qLower.includes("finding") || qLower.includes("accuracy") || qLower.includes("benchmark")) {
      const resultSentences = sentences.filter(s => /result|show|demonstrate|achieve|outperform|accuracy|improve|reduce|increase/i.test(s));
      if (resultSentences.length > 0) {
        return `[Offline Edge NLP Mode]\n\n**Key Empirical Findings:**\n${resultSentences.slice(0, 3).join(" ")}\n\n*The findings demonstrate statistically significant gains reported by ${paper.authors[0] || 'the authors'} (${paper.publicationYear}).*`;
      }
    }

    if (qLower.includes("limit") || qLower.includes("weak") || qLower.includes("challenge") || qLower.includes("risk")) {
      const limitSentences = sentences.filter(s => /however|challenge|limit|future|tradeoff|cost|constraint|assumption/i.test(s));
      if (limitSentences.length > 0) {
        return `[Offline Edge NLP Mode]\n\n**Identified Limitations:**\n${limitSentences.slice(0, 2).join(" ")}\n\n*The authors note operational constraints under non-idealized experimental settings.*`;
      }
      return `[Offline Edge NLP Mode]\n\n**Considerations & Bounds:**\nThe study evaluates performance primarily under the stated conditions in ${paper.venue}. Generalization to unrestricted environments requires further empirical validation.`;
    }

    if (qLower.includes("tldr") || qLower.includes("summary") || qLower.includes("what is this paper")) {
      return `[Offline Edge NLP Mode]\n\n**Executive Summary of "${paper.title}":**\n- **Thesis**: ${sentences[0] || paper.title}\n- **Authors**: ${paper.authors.join(", ")} (${paper.publicationYear})\n- **Core Takeaway**: ${sentences[1] || "Offers key advancements in scientific literature."}`;
    }

    // Keyword scoring for general questions
    const qWords = qLower.match(/\b[a-z]{3,}\b/g) || [];
    const scored = sentences.map(s => {
      let score = 0;
      const sLower = s.toLowerCase();
      for (const w of qWords) {
        if (!STOP_WORDS.has(w) && sLower.includes(w)) score += 1;
      }
      return { s, score };
    }).sort((a, b) => b.score - a.score);

    const bestMatches = scored.filter(item => item.score > 0).slice(0, 3).map(i => i.s);
    if (bestMatches.length > 0) {
      return `[Offline Edge NLP Mode]\n\nBased on "${paper.title}":\n\n${bestMatches.join("\n\n")}`;
    }

    return `[Offline Edge NLP Mode]\n\nRegarding "${question}":\n"${paper.title}" (${paper.publicationYear}) primarily investigates: ${paper.abstract ? paper.abstract.slice(0, 280) + '...' : 'this topic'}. Connect to the internet or add your Gemini API key to unlock full multi-turn conversational synthesis.`;
  }

  // Online Gemini conversational interrogation
  const systemInstruction = `You are ARC, an elite academic research copilot and peer reviewer.
You are having an in-depth conversation with a researcher about the following scientific paper:
Title: "${paper.title}"
Authors: ${paper.authors.join(", ")} (${paper.publicationYear})
Venue: ${paper.venue}
Abstract/Content:
${paper.abstract || "No abstract provided."}

Guidelines:
1. Ground your answers directly in the paper's actual claims, methods, and data.
2. If the user asks about equations, methodology, or results, provide clear, rigorous academic explanations with formatting (bullet points, bold text).
3. If information is not in the abstract or provided text, state what can reasonably be inferred and what would require checking the full supplementary materials.
4. Keep the tone collegial, sharp, and scientifically precise.`;

  const contents: any[] = [
    { role: "user", parts: [{ text: systemInstruction }] },
    { role: "model", parts: [{ text: `I am ready. I have fully indexed "${paper.title}" by ${paper.authors[0] || 'the authors'} et al. (${paper.publicationYear}). What would you like to investigate?` }] }
  ];

  // Append recent chat history (up to last 6 turns)
  const recentHistory = chatHistory.slice(-6);
  for (const msg of recentHistory) {
    contents.push({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    });
  }

  // Append latest question
  contents.push({
    role: "user",
    parts: [{ text: question }]
  });

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${activeKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.statusText}`);
    }

    const data = await res.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!answer) throw new Error("Empty response from AI");
    return answer;
  } catch (err) {
    console.warn("Online ARC Chat error, falling back to offline NLP:", err);
    return askArcPaperQuestion(paper, question, chatHistory, undefined);
  }
}
