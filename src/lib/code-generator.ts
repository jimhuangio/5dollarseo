import { randomBytes } from "crypto";

// Safe charset: 27 chars excluding confusable glyphs
// Excluded: 0 (O), 1 (l, I), B (8), S (5), Z (2), G (6)
const SAFE_CHARSET = "ACDEFHJKMNPQRTUVWXY23456789";
const CODE_LENGTH = 14;

export function generateAccountCode(): string {
  const charsetLength = SAFE_CHARSET.length;
  let code = "";

  // Use rejection sampling to avoid modulo bias
  while (code.length < CODE_LENGTH) {
    const byte = randomBytes(1)[0];
    // Only accept bytes that map cleanly into charset range
    if (byte < Math.floor(256 / charsetLength) * charsetLength) {
      code += SAFE_CHARSET[byte % charsetLength];
    }
  }

  return code;
}

// Format for display: XXXX-XXXXX-XXXXX
export function formatCode(code: string): string {
  return `${code.slice(0, 4)}-${code.slice(4, 9)}-${code.slice(9, 14)}`;
}

// Strip dashes for storage/lookup
export function normalizeCode(input: string): string {
  return input.replace(/[-\s]/g, "").toUpperCase();
}

// Validate code is well-formed (14 chars from safe charset)
export function isValidCodeFormat(code: string): boolean {
  const normalized = normalizeCode(code);
  if (normalized.length !== CODE_LENGTH) return false;
  return [...normalized].every((c) => SAFE_CHARSET.includes(c));
}
