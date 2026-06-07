/**
 * Flatten an arbitrary raw bank object into dotted key/value pairs for the
 * transaction detail modal ("any additional fields from the raw bank data").
 * Nested objects become dotted paths (e.g. "merchant.city"); arrays/values are
 * stringified. Keeps insertion order for stable display.
 */

export interface FlatField {
  key: string;
  value: string;
}

function stringifyValue(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}

export function flattenObject(input: unknown, prefix = ""): FlatField[] {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return [{ key: prefix || "value", value: stringifyValue(input) }];
  }

  const result: FlatField[] = [];
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      result.push(...flattenObject(value, path));
    } else {
      result.push({ key: path, value: stringifyValue(value) });
    }
  }
  return result;
}
