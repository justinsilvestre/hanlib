import { LexiconEntry } from "@/app/texts/Passage";

export function findEntryMatchingEnKeywords(
  entries: LexiconEntry[],
  enKeywords: string[]
) {
  return entries.find((e) =>
    getEntryEnKeywords(e).some((k) => enKeywords.includes(k))
  );
}
export function getEntryEnKeywords(entry: LexiconEntry): string[] {
  return entry.en?.split(/[,;]/).map((s) => toEnMatchKeyword(s)) || [];
}
export function toEnMatchKeyword(s: string): string {
  return s.trim().replace(/^(an? |to |the )/g, "");
}
