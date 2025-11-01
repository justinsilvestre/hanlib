import { normalizeText } from "../texts/[textId]/punctuation";
import { Passage } from "../texts/Passage";

export function getPassageChars(passage: Passage) {
  const frontmatterZi = getEmbeddedChineseSegments(
    passage.frontmatter.description
  ).join("");

  return new Set(
    frontmatterZi +
      passage.lines.map((l) => normalizeText(l.chinese)).join("") +
      Object.values(passage.notes)
        .flatMap((n) => getEmbeddedChineseSegments(n))
        .join("")
  );
}

function getEmbeddedChineseSegments(text: string) {
  return Array.from(text.matchAll(/(?<=`)[^`\s\n]+(?=`)/g), (t) =>
    normalizeText(t[0])
  );
}
