/**
 * Small dependency-free scorer over generated metadata only (title, filename,
 * path, breadcrumbs, classification). No full-text file content is fetched
 * for search, so hundreds of prompt files never need to be downloaded.
 */
export function search(files, rawQuery, limit = 40) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];
  const terms = query.split(/\s+/).filter(Boolean);

  const results = [];

  for (const record of files) {
    const haystacks = [
      [record.title.toLowerCase(), 5],
      [record.filename.toLowerCase(), 4],
      [record.breadcrumbs.join(" ").toLowerCase(), 3],
      [record.path.toLowerCase(), 2],
      [record.classification.toLowerCase(), 1],
    ];

    let score = 0;
    let matchedOn = "";

    for (const term of terms) {
      let bestTermScore = 0;
      for (const [text, weight] of haystacks) {
        if (!text.includes(term)) continue;
        let s = weight;
        if (text === term) s += 6;
        else if (text.startsWith(term)) s += 3;
        if (s > bestTermScore) {
          bestTermScore = s;
          if (!matchedOn) matchedOn = text;
        }
      }
      if (bestTermScore === 0) {
        score = 0;
        break; // every term must match somewhere
      }
      score += bestTermScore;
    }

    if (score > 0) results.push({ record, score, matchedOn });
  }

  results.sort((a, b) => b.score - a.score || a.record.path.localeCompare(b.record.path));
  return results.slice(0, limit);
}
