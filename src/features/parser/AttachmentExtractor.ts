import { PARSER_ATTRIBUTES, PARSER_SELECTORS } from './DomSelectors';
import type { ParsedAttachment } from './ParserTypes';

const mimeTypesByExtension: Readonly<Record<string, string>> = {
  csv: 'text/csv',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  pdf: 'application/pdf',
  png: 'image/png',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/zip',
};

/**
 * Extracts attachment metadata without downloading attachment contents.
 */
export class AttachmentExtractor {
  /**
   * Extracts and de-duplicates attachments belonging to one message.
   */
  extract(message: Element): readonly ParsedAttachment[] {
    const attachments = Array.from(
      message.querySelectorAll(PARSER_SELECTORS.attachment),
    ).map((element) => this.extractAttachment(element));
    const seen = new Set<string>();

    return attachments.filter((attachment) => {
      const key =
        attachment.id ??
        `${attachment.name}:${attachment.sizeBytes ?? attachment.sizeLabel ?? ''}`;
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }

  /**
   * Extracts one attachment descriptor from Gmail metadata.
   */
  private extractAttachment(element: Element): ParsedAttachment {
    const name =
      this.firstAttribute(element, PARSER_ATTRIBUTES.attachmentName) ??
      element.textContent?.trim() ??
      'Unnamed attachment';
    const sizeLabel =
      this.firstAttribute(element, PARSER_ATTRIBUTES.attachmentSize) ??
      this.findSizeLabel(element.textContent ?? '');

    return {
      id: this.firstAttribute(element, PARSER_ATTRIBUTES.attachmentId),
      mimeType:
        element.getAttribute('type') ??
        this.extractMimeType(element.getAttribute('download_url')) ??
        this.inferMimeType(name),
      name: this.cleanAttachmentName(name),
      sizeBytes: sizeLabel ? this.parseSize(sizeLabel) : null,
      sizeLabel,
    };
  }

  /**
   * Returns the first non-empty value from a list of attributes.
   */
  private firstAttribute(
    element: Element,
    attributes: readonly string[],
  ): string | null {
    return (
      attributes
        .map((attribute) => element.getAttribute(attribute))
        .find((value): value is string => Boolean(value?.trim())) ?? null
    );
  }

  /**
   * Removes Gmail action suffixes from an accessible attachment label.
   */
  private cleanAttachmentName(value: string): string {
    return value.replace(/\s+(download|preview|save to drive)$/i, '').trim();
  }

  /**
   * Extracts MIME type from Gmail's download_url metadata.
   */
  private extractMimeType(downloadUrl: string | null): string | null {
    const mimeType = downloadUrl?.split(':', 1)[0]?.trim();
    return mimeType?.includes('/') ? mimeType : null;
  }

  /**
   * Infers MIME type from a filename extension when Gmail omits it.
   */
  private inferMimeType(name: string): string | null {
    const extension = name.split('.').at(-1)?.toLowerCase();
    return extension ? mimeTypesByExtension[extension] ?? null : null;
  }

  /**
   * Finds a human-readable byte size in visible attachment text.
   */
  private findSizeLabel(value: string): string | null {
    const match = /\b\d+(?:[.,]\d+)?\s*(?:bytes?|kb|mb|gb|tb)\b/i.exec(value);
    return match?.[0] ?? null;
  }

  /**
   * Converts a human-readable attachment size to bytes.
   */
  private parseSize(value: string): number | null {
    const match = /^(\d+(?:[.,]\d+)?)\s*(bytes?|kb|mb|gb|tb)$/i.exec(
      value.trim(),
    );
    if (!match) {
      const rawBytes = Number(value);
      return Number.isFinite(rawBytes) ? rawBytes : null;
    }

    const amount = Number(match[1]?.replace(',', '.'));
    const unit = match[2]?.toLowerCase();
    const multipliers: Readonly<Record<string, number>> = {
      byte: 1,
      bytes: 1,
      gb: 1024 ** 3,
      kb: 1024,
      mb: 1024 ** 2,
      tb: 1024 ** 4,
    };

    const multiplier = unit ? multipliers[unit] : undefined;
    return multiplier !== undefined && Number.isFinite(amount)
      ? Math.round(amount * multiplier)
      : null;
  }
}
