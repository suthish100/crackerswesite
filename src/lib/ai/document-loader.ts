import fs from 'fs';
import path from 'path';

export interface LoadedDocument {
  source: string;
  documentType: string;
  title: string;
  rawContent: string;
}

export async function extractTextFromFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.txt' || ext === '.md') {
    return fs.readFileSync(filePath, 'utf-8');
  }

  if (ext === '.pdf') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfMod: any = await import('pdf-parse');
    const parseFn = typeof pdfMod === 'function' ? pdfMod : pdfMod.default || pdfMod;
    const buffer = fs.readFileSync(filePath);
    const data = await parseFn(buffer);
    return data?.text || '';
  }

  if (ext === '.docx') {
    const mammoth = await import('mammoth');
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }

  throw new Error(`Unsupported document format: ${ext}`);
}

export function cleanDocumentText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function deriveDocumentMetadata(fileName: string, content: string): { title: string; documentType: string } {
  // Extract title from first markdown H1 or fallback to filename
  const h1Match = content.match(/^#\s+(.+)$/m);
  const baseName = path.basename(fileName, path.extname(fileName));
  const title = h1Match ? h1Match[1].trim() : baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const lowerName = fileName.toLowerCase();
  let documentType = 'general';
  if (lowerName.includes('policy')) documentType = 'policy';
  else if (lowerName.includes('faq')) documentType = 'faq';
  else if (lowerName.includes('cracker') || lowerName.includes('product')) documentType = 'product_guide';
  else if (lowerName.includes('term')) documentType = 'legal';
  else if (lowerName.includes('about')) documentType = 'about';

  return { title, documentType };
}

export async function loadDocumentsFromDirectory(dirPath: string): Promise<LoadedDocument[]> {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const entries = fs.readdirSync(dirPath);
  const supportedExtensions = ['.md', '.txt', '.pdf', '.docx'];
  const results: LoadedDocument[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isFile()) {
      const ext = path.extname(entry).toLowerCase();
      if (supportedExtensions.includes(ext)) {
        try {
          const raw = await extractTextFromFile(fullPath);
          const cleaned = cleanDocumentText(raw);
          if (cleaned.length > 0) {
            const { title, documentType } = deriveDocumentMetadata(entry, cleaned);
            results.push({
              source: entry,
              documentType,
              title,
              rawContent: cleaned,
            });
          }
        } catch (error) {
          console.error(`Failed to parse document ${entry}:`, error);
        }
      }
    }
  }

  return results;
}
