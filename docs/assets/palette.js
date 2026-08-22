// Deterministic hash -> hue. Any new root folder that appears in the future
// automatically gets a stable, distinct identity without any code change.
export function hashHue(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

export function rootAccent(root) {
  const hue = hashHue(root);
  return `hsl(${hue} 70% 42%)`;
}

export function rootAccentSoft(root) {
  const hue = hashHue(root);
  return `hsl(${hue} 60% 92%)`;
}

const CLASSIFICATION_LABELS = {
  doc: "DOC",
  skill: "SKILL",
  archived: "ARCHIVED",
  official: "OFFICIAL",
  reference: "REFERENCE",
  example: "EXAMPLE",
  raw: "RAW",
  primary: "PROMPT",
};

export function classificationLabel(key) {
  return CLASSIFICATION_LABELS[key] ?? key.toUpperCase();
}
