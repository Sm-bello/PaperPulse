import { marked } from 'marked';
import mammoth from 'mammoth';

export interface ParsedDocument {
  title: string;
  type: 'pdf' | 'markdown' | 'word' | 'text';
  content?: string; // HTML or plain text
  url?: string;
  size?: number;
}

/**
 * Configure marked for clean, secure GitHub Flavored Markdown
 */
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Parses any user-uploaded file (PDF, Markdown, DOCX, TXT, CSV, Code)
 */
export async function parseDocumentFile(file: File): Promise<ParsedDocument> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  // 1. PDF Documents
  if (ext === 'pdf') {
    const objectUrl = URL.createObjectURL(file);
    return {
      title: file.name,
      type: 'pdf',
      url: objectUrl,
      size: file.size,
    };
  }

  // 2. Markdown Documents (.md, .markdown)
  if (ext === 'md' || ext === 'markdown') {
    const text = await file.text();
    const html = await marked.parse(text);
    return {
      title: file.name,
      type: 'markdown',
      content: html,
      size: file.size,
    };
  }

  // 3. Word Documents (.docx)
  if (ext === 'docx') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      return {
        title: file.name,
        type: 'word',
        content: result.value || "<p>Empty Word document</p>",
        size: file.size,
      };
    } catch (err) {
      console.warn("Word parser notice, reading as raw text:", err);
      const text = await file.text();
      return {
        title: file.name,
        type: 'text',
        content: text,
        size: file.size,
      };
    }
  }

  // 4. Text, Code, CSV, JSON, TeX, BibTeX Documents
  const text = await file.text();
  return {
    title: file.name,
    type: 'text',
    content: text,
    size: file.size,
  };
}

/**
 * Parses remote or inline markdown text
 */
export async function parseMarkdownText(markdown: string): Promise<string> {
  return marked.parse(markdown);
}
