import { DocumentChunk } from './types';
import { LoadedDocument } from './document-loader';

export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

export function chunkDocument(
  doc: LoadedDocument,
  options: ChunkOptions = {}
): DocumentChunk[] {
  const chunkSize = options.chunkSize || 800;
  const chunkOverlap = options.chunkOverlap || 150;

  const content = doc.rawContent;
  const chunks: DocumentChunk[] = [];

  // Split primarily by markdown headers (##, ###) or double newlines
  const sections = content.split(/(?=\n#{1,3}\s+)/g);
  let chunkIndex = 1;

  for (const section of sections) {
    const trimmedSection = section.trim();
    if (!trimmedSection) continue;

    if (trimmedSection.length <= chunkSize) {
      // Section fits comfortably into one chunk
      chunks.push({
        chunkId: `${doc.source.replace(/[^a-zA-Z0-9]/g, '_')}_${String(chunkIndex++).padStart(3, '0')}`,
        source: doc.source,
        documentType: doc.documentType,
        title: doc.title,
        content: trimmedSection,
        createdAt: new Date().toISOString(),
      });
    } else {
      // Split larger sections by paragraphs or sliding window with overlap
      const paragraphs = trimmedSection.split(/\n\n+/);
      let currentBuffer = '';

      // Extract section heading if present to prepend as context to sub-chunks
      const headingMatch = trimmedSection.match(/^#{1,3}\s+(.+)$/m);
      const sectionHeading = headingMatch ? `[Context: ${headingMatch[1]}]\n` : '';

      for (const para of paragraphs) {
        const trimmedPara = para.trim();
        if (!trimmedPara) continue;

        if ((currentBuffer + '\n\n' + trimmedPara).length <= chunkSize) {
          currentBuffer = currentBuffer ? currentBuffer + '\n\n' + trimmedPara : trimmedPara;
        } else {
          if (currentBuffer.length > 0) {
            chunks.push({
              chunkId: `${doc.source.replace(/[^a-zA-Z0-9]/g, '_')}_${String(chunkIndex++).padStart(3, '0')}`,
              source: doc.source,
              documentType: doc.documentType,
              title: doc.title,
              content: currentBuffer,
              createdAt: new Date().toISOString(),
            });

            // Preserve overlap from end of current buffer
            const overlapText = currentBuffer.slice(-chunkOverlap);
            currentBuffer = sectionHeading + overlapText + '\n\n' + trimmedPara;
          } else {
            // A single very long paragraph - split by characters with overlap
            let start = 0;
            while (start < trimmedPara.length) {
              const end = Math.min(start + chunkSize, trimmedPara.length);
              const slice = trimmedPara.slice(start, end);
              chunks.push({
                chunkId: `${doc.source.replace(/[^a-zA-Z0-9]/g, '_')}_${String(chunkIndex++).padStart(3, '0')}`,
                source: doc.source,
                documentType: doc.documentType,
                title: doc.title,
                content: (start > 0 ? sectionHeading : '') + slice,
                createdAt: new Date().toISOString(),
              });
              start += chunkSize - chunkOverlap;
            }
            currentBuffer = '';
          }
        }
      }

      if (currentBuffer.trim().length > 0) {
        chunks.push({
          chunkId: `${doc.source.replace(/[^a-zA-Z0-9]/g, '_')}_${String(chunkIndex++).padStart(3, '0')}`,
          source: doc.source,
          documentType: doc.documentType,
          title: doc.title,
          content: currentBuffer.trim(),
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  return chunks;
}
