import { Injectable, Logger } from '@nestjs/common';
import * as mammoth from 'mammoth';

// pdf-parse is a CommonJS module, use require
const pdf = require('pdf-parse');

export interface ExtractionResult {
  success: boolean;
  text: string;
  error?: string;
  metadata?: {
    pages?: number;
    wordCount?: number;
  };
}

@Injectable()
export class TextExtractorService {
  private readonly logger = new Logger(TextExtractorService.name);

  /**
   * Extract text from PDF using pdf-parse library
   */
  async extractFromPDF(buffer: Buffer): Promise<ExtractionResult> {
    try {
      const data = await pdf(buffer);
      
      if (!data.text || data.text.trim().length === 0) {
        return {
          success: false,
          text: '',
          error: 'No readable text found in PDF. File may be scanned/image-only or empty.',
        };
      }

      const cleanedText = this.cleanText(data.text);
      const wordCount = cleanedText.split(/\s+/).length;

      return {
        success: true,
        text: cleanedText,
        metadata: {
          pages: data.numpages,
          wordCount,
        },
      };
    } catch (error) {
      this.logger.error(`PDF extraction failed: ${error.message}`);
      return {
        success: false,
        text: '',
        error: `Failed to extract PDF text: ${error.message}`,
      };
    }
  }

  /**
   * Extract text from DOCX using mammoth library
   */
  async extractFromDOCX(buffer: Buffer): Promise<ExtractionResult> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      
      if (!result.value || result.value.trim().length === 0) {
        return {
          success: false,
          text: '',
          error: 'No readable text found in DOCX file.',
        };
      }

      const cleanedText = this.cleanText(result.value);
      const wordCount = cleanedText.split(/\s+/).length;

      // Log warnings from mammoth (e.g., unsupported features)
      if (result.messages && result.messages.length > 0) {
        this.logger.warn(`DOCX extraction warnings: ${result.messages.map(m => m.message).join(', ')}`);
      }

      return {
        success: true,
        text: cleanedText,
        metadata: {
          wordCount,
        },
      };
    } catch (error) {
      this.logger.error(`DOCX extraction failed: ${error.message}`);
      return {
        success: false,
        text: '',
        error: `Failed to extract DOCX text: ${error.message}`,
      };
    }
  }

  /**
   * Universal text extractor that handles both PDF and DOCX
   */
  async extractText(buffer: Buffer, fileType: string): Promise<ExtractionResult> {
    const normalizedType = fileType.toLowerCase().replace('.', '').trim();

    switch (normalizedType) {
      case 'pdf':
        return this.extractFromPDF(buffer);
      case 'docx':
      case 'doc':
        return this.extractFromDOCX(buffer);
      default:
        return {
          success: false,
          text: '',
          error: `Unsupported file type: ${fileType}. Supported formats: PDF, DOCX`,
        };
    }
  }

  /**
   * Clean and normalize extracted text
   */
  private cleanText(text: string): string {
    if (!text) return '';

    // Remove excessive whitespace while preserving structure
    let cleaned = text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ') // Multiple spaces to single space
      .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
      .replace(/^\s+/gm, '') // Trim start of lines
      .trim();

    // Remove common PDF artifacts
    cleaned = cleaned
      .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '') // Non-printable chars
      .replace(/\uf0b7/g, '•') // Convert bullet points
      .replace(/\uf0a7/g, '•');

    return cleaned;
  }

  /**
   * Validate if extracted text looks reasonable
   */
  validateExtractedText(text: string): { valid: boolean; reason?: string } {
    if (!text || text.trim().length === 0) {
      return { valid: false, reason: 'No text extracted' };
    }

    // Check for minimum word count
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount < 10) {
      return { valid: false, reason: 'Text too short (minimum 10 words expected)' };
    }

    // Check for excessive non-ASCII characters (might indicate encoding issues)
    const nonAsciiRatio = (text.match(/[^\x00-\x7F]/g) || []).length / text.length;
    if (nonAsciiRatio > 0.5) {
      return { valid: false, reason: 'Text contains too many non-ASCII characters' };
    }

    // Check if it looks like binary data
    if (text.includes('%PDF') || text.includes('PK\x03\x04')) {
      return { valid: false, reason: 'Extracted text contains binary data' };
    }

    return { valid: true };
  }
}
