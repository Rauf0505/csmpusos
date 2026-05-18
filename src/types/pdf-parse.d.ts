declare module "pdf-parse/lib/pdf-parse.js" {
  interface PDFData {
    text: string;
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown>;
    version: string;
  }

  function pdfParse(dataBuffer: Buffer): Promise<PDFData>;
  export default pdfParse;
}

declare module "mammoth" {
  interface MammothResult {
    value: string;
    messages: unknown[];
  }

  export function extractRawText(options: { buffer: Buffer }): Promise<MammothResult>;
}
