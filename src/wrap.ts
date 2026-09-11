/**
 * Greedy paragraph wrapping. Widths are measured in Unicode code points
 * rather than UTF-16 code units, so characters outside the BMP (emoji,
 * some CJK extensions) count as one column instead of two. This is still
 * not true display-width-aware wrapping (it doesn't know that a CJK
 * character is visually two columns wide) - that would need a proper
 * East Asian Width table, which is out of scope for now.
 */

export interface WrapOptions {
  /** Maximum number of columns per line. Must be a positive integer. */
  width: number;
  /**
   * When a single word is longer than `width`, split it across lines
   * instead of letting it overflow. Defaults to true.
   */
  hardBreakLongWords?: boolean;
}

function codePoints(s: string): string[] {
  return Array.from(s);
}

function codePointLength(s: string): number {
  return codePoints(s).length;
}

/** Wraps one paragraph (no embedded newlines) into a list of lines. */
export function wrapParagraph(text: string, options: WrapOptions): string[] {
  const { width, hardBreakLongWords = true } = options;
  if (!Number.isInteger(width) || width <= 0) {
    throw new Error(`width must be a positive integer, got ${width}`);
  }

  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const lines: string[] = [];
  let current = "";
  let currentLen = 0;

  const flush = () => {
    if (current.length > 0) {
      lines.push(current);
      current = "";
      currentLen = 0;
    }
  };

  for (const word of words) {
    const wordLen = codePointLength(word);

    if (wordLen > width) {
      flush();
      if (hardBreakLongWords) {
        let rest = codePoints(word);
        while (rest.length > width) {
          lines.push(rest.slice(0, width).join(""));
          rest = rest.slice(width);
        }
        current = rest.join("");
        currentLen = rest.length;
      } else {
        lines.push(word);
      }
      continue;
    }

    const separatorLen = current.length > 0 ? 1 : 0;
    if (currentLen + separatorLen + wordLen > width) {
      flush();
      current = word;
      currentLen = wordLen;
    } else {
      current = current.length > 0 ? `${current} ${word}` : word;
      currentLen += separatorLen + wordLen;
    }
  }
  flush();

  return lines.length > 0 ? lines : [""];
}

/**
 * Wraps arbitrary text. Existing newlines are treated as hard paragraph
 * breaks and preserved - each line between them is wrapped independently,
 * and blank lines pass through untouched.
 */
export function wrapText(text: string, options: WrapOptions): string[] {
  const paragraphs = text.split("\n");
  const result: string[] = [];
  for (const paragraph of paragraphs) {
    if (paragraph.trim().length === 0) {
      result.push("");
    } else {
      result.push(...wrapParagraph(paragraph, options));
    }
  }
  return result;
}

export function longestLineLength(lines: string[]): number {
  return lines.reduce((max, line) => Math.max(max, codePointLength(line)), 0);
}
