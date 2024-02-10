import {
  LexiconEntry,
  PassageVocab,
  VocabEntryPronunciationKey,
  parsePassage,
  parsePassageVocabList,
} from "@/app/texts/Passage";
import {
  getPassageFileContents,
  getPassageVocabFileContents,
  getTextsIds,
} from "@/app/texts/files";
import * as fs from "fs";
import * as path from "path";

const prebuildDirectoryPath = path.join(process.cwd(), "prebuild");

if (!fs.existsSync(prebuildDirectoryPath)) {
  fs.mkdirSync(prebuildDirectoryPath);
}

const lexicon = aggregateVocabulary();
const lexiconFilePath = path.join(prebuildDirectoryPath, "lexicon.json");
fs.writeFileSync(lexiconFilePath, JSON.stringify(lexicon, null, 2));
console.log(`Wrote lexicon to ${lexiconFilePath}`);
writePassageVocabularyJsons(lexicon);

function aggregateVocabulary() {
  const textsIds = getTextsIds();

  const lexicon = textsIds.reduce((lexicon, textId) => {
    const vocabFileContents = getPassageVocabFileContents(textId);
    const vocab = parsePassageVocabList(vocabFileContents);
    return mergeVocab(lexicon, vocab);
  }, {} as PassageVocab);
  return lexicon;
}

function writePassageVocabularyJsons(lexicon: PassageVocab) {
  for (const textId of getTextsIds()) {
    const vocab = parsePassageVocabList(getPassageVocabFileContents(textId));
    const passage = parsePassage(getPassageFileContents(textId));

    const vocabFilePath = path.join(
      prebuildDirectoryPath,
      `${textId}.vocab.json`
    );
    const passageChars = new Set(passage.lines.map((l) => l.chinese).join(""));

    for (const char of passageChars) {
      if (!vocab[char]) {
        vocab[char] = lexicon[char];
      }
    }

    fs.writeFileSync(vocabFilePath, JSON.stringify(vocab, null, 2), "utf-8");
    console.log(`Wrote vocab for ${textId} to ${vocabFilePath}`);
  }
}

function mergeVocab(a: PassageVocab, b: PassageVocab): PassageVocab {
  const merged: PassageVocab = { ...a };
  for (const chinese in b) {
    if (merged[chinese]) {
      merged[chinese] = mergeLexiconEntries(merged[chinese]!, b[chinese]!);
    } else {
      merged[chinese] = b[chinese];
    }
  }
  return merged;
}
function mergeLexiconEntries(
  a: LexiconEntry[],
  b: LexiconEntry[]
): LexiconEntry[] {
  const merged: LexiconEntry[] = [...a];
  for (const entry of b) {
    const bEntryEnKeywords = getEntryEnKeywords(entry);
    const matchingEntry = merged.find((e) =>
      getEntryEnKeywords(e).some((k) => bEntryEnKeywords.includes(k))
    );
    if (matchingEntry) {
      matchingEntry.en = mergeEntryEnKeywords(matchingEntry, entry);
      matchingEntry.jyutping = mergeEntryPronunciation(
        matchingEntry,
        entry,
        "jyutping"
      );
      matchingEntry.pinyin = mergeEntryPronunciation(
        matchingEntry,
        entry,
        "pinyin"
      );
      matchingEntry.vi = mergeEntryPronunciation(matchingEntry, entry, "vi");
    } else {
      merged.push(entry);
    }
  }
  return merged;
}

function getEntryEnKeywords(entry: LexiconEntry): string[] {
  return entry.en?.split(/[,;]/).map((s) => toEnMatchKeyword(s)) || [];
}
function toEnMatchKeyword(s: string): string {
  return s.trim().replace(/^(an? |to |the )/, "");
}

function mergeEntryEnKeywords(a: LexiconEntry, b: LexiconEntry): string {
  // const aKeywords = getEntryEnKeywords(a);
  // const bKeywords = getEntryEnKeywords(b);
  // const mergedKeywords = [...new Set([...aKeywords, ...bKeywords])].join(', ');
  // return mergedKeywords;
  const mergedSegments =
    a.en
      ?.split(";")
      .map((semicolonSegment) =>
        semicolonSegment.split(",").map((commaSegment) => commaSegment.trim())
      ) || [];
  const bSegments =
    b.en
      ?.split(";")
      .map((semicolonSegment) =>
        semicolonSegment.split(",").map((commaSegment) => commaSegment.trim())
      ) || [];

  for (const semiColonSegment of bSegments) {
    let matchingSemicolonSegmentIndex = -1;
    let matchingCommaSegmentIndex = -1;
    for (const commaSegment of semiColonSegment) {
      const segmentKeyword = toEnMatchKeyword(commaSegment);
      matchingCommaSegmentIndex = mergedSegments.findIndex((segment) =>
        segment.some((cs) => toEnMatchKeyword(cs) === segmentKeyword)
      );
      if (matchingCommaSegmentIndex !== -1) {
        matchingSemicolonSegmentIndex = mergedSegments.findIndex((segment) =>
          segment.some((cs) => toEnMatchKeyword(cs) === segmentKeyword)
        );
        break;
      }
    }
  }

  return mergedSegments.map((segment) => segment.join(", ")).join("; ");
}

function mergeEntryPronunciation(
  a: LexiconEntry,
  b: LexiconEntry,
  key: VocabEntryPronunciationKey
) {
  if (a[key] === b[key]) {
    return a[key];
  }
  if (!a[key] && b[key]) {
    return b[key];
  }
  if (!b[key] && a[key]) {
    return a[key];
  }
  const aSegments = a[key]?.split(/, ?/) || [];
  const bSegments = b[key]?.split(/, ?/) || [];
  const mergedSegments = [...new Set([...aSegments, ...bSegments])].join(",");
  return mergedSegments;
}
