import {
  getEntryEnKeywords,
  findEntryMatchingEnKeywords,
  toEnMatchKeyword,
} from "../lexiconEntryEnKeywords";
import { getTextsIds, getPassageVocabFileContents } from "../texts/files";
import { parsePassageVocabListTsv } from "../texts/Passage";
import {
  LexiconEntry,
  CorpusTermVariants,
  CorpusVocab,
  LexiconJson,
  LexiconEntryFieldKey,
} from "../texts/lexicon";

export function aggregateVocabulary() {
  const textsIds = getTextsIds();

  const lexicon = textsIds.reduce(
    (acc, textId) => {
      const vocabFileContents = getPassageVocabFileContents(textId);

      const vocabWithVariants = parsePassageVocabListTsv(
        textId,
        vocabFileContents
      );
      return mergeVocab(acc, vocabWithVariants);
    },
    {
      vocab: {},
      variants: {},
    } as LexiconJson
  );
  return lexicon;
}

function mergeVocab(a: LexiconJson, b: LexiconJson): LexiconJson {
  const mergedVocab: CorpusVocab = { ...a.vocab };
  const mergedVariants: CorpusTermVariants = { ...a.variants };
  for (const char in b.vocab) {
    if (mergedVocab[char]) {
      mergedVocab[char] = mergeLexiconEntries(
        mergedVocab[char],
        b.vocab[char]! // currently guaranteed
      );
    } else {
      mergedVocab[char] = b.vocab[char];
    }
  }
  for (const secondaryVariant in b.variants) {
    if (mergedVariants[secondaryVariant]) {
      mergedVariants[secondaryVariant] = [
        ...new Set([
          ...mergedVariants[secondaryVariant],
          ...b.variants[secondaryVariant],
        ]),
      ];
    } else {
      mergedVariants[secondaryVariant] = b.variants[secondaryVariant];
    }
  }
  return { vocab: mergedVocab, variants: mergedVariants };
}

function mergeLexiconEntries(
  a: LexiconEntry[],
  b: LexiconEntry[]
): LexiconEntry[] {
  const merged: LexiconEntry[] = [...a];
  for (const entry of b) {
    const bEntryEnKeywords = getEntryEnKeywords(entry);
    const matchingEntry = findEntryMatchingEnKeywords(merged, bEntryEnKeywords);
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

function mergeEntryEnKeywords(a: LexiconEntry, b: LexiconEntry): string {
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
  key: LexiconEntryFieldKey
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
