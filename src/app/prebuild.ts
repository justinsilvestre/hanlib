import {
  LexiconEntry,
  Passage,
  PassageTermVariants,
  PassageVocab,
  VocabEntryPronunciationKey,
  parsePassage,
  parsePassageVocabList,
  vocabFileColumns,
} from "@/app/texts/Passage";
import {
  getPassageFileContents,
  getPassageVocabFileContents,
  getPassageVocabFilePath,
  getTextsIds,
} from "@/app/texts/files";
import * as fs from "fs";
import * as path from "path";
import {
  getEntryEnKeywords,
  findEntryMatchingEnKeywords,
  toEnMatchKeyword,
} from "./lexiconEntryEnKeywords";

import * as qieyun from "qieyun";

// @ts-expect-error no typings
import unihan from "@silvestre/cjk-unihan";
import { normalizeText } from "./texts/[textId]/punctuation";
import { prebuildDirectoryPath, lexiconFilePath } from "./texts/files";

if (!fs.existsSync(prebuildDirectoryPath)) {
  fs.mkdirSync(prebuildDirectoryPath);
}

const lexicon = aggregateVocabulary();

fillInMissingReadingsInTsvs().then(() => {
  fs.writeFileSync(lexiconFilePath, JSON.stringify(lexicon, null, 2));
  console.log(`Wrote lexicon to ${lexiconFilePath}`);
  writePassageVocabularyJsons(lexicon);
  console.log(`Done writing vocab jsons`);
  const termsCount = Object.keys(lexicon.vocab).length;
  const charactersCount = Object.keys(lexicon.vocab).reduce(
    (count, term) => count + (term.length === 1 ? 1 : 0),
    0
  );
  console.log(`Total terms: ${termsCount}`);
  console.log(`Total characters: ${charactersCount}`);
});

function aggregateVocabulary() {
  const textsIds = getTextsIds();

  const lexicon = textsIds.reduce(
    (acc, textId) => {
      const vocabFileContents = getPassageVocabFileContents(textId);

      const vocabWithVariants = parsePassageVocabList(
        textId,
        vocabFileContents
      );
      return mergeVocab(acc, vocabWithVariants);
    },
    {
      vocab: {},
      variants: {},
    } as PassageVocabWithVariants
  );
  return lexicon;
}

async function fillInMissingReadingsInTsvs() {
  let brandtPassagesVisited = 0;
  let registeredChars = new Set<string>();
  for (const textId of getTextsIds()) {
    const isBrandtPassage = textId.startsWith("brandt-");
    if (isBrandtPassage) brandtPassagesVisited += 1;
    const vocabFileContents = getPassageVocabFileContents(textId);
    const { vocab, variants } = parsePassageVocabList(
      textId,
      vocabFileContents
    );
    const mainToSecondaryVariants: {
      [mainVariant: string]: string[];
    } = Object.entries(variants).reduce(
      (acc, [secondaryVariant, mainVariants]) => {
        for (const mainVariant of mainVariants) {
          acc[mainVariant] = acc[mainVariant] || [];
          acc[mainVariant]!.push(secondaryVariant);
        }
        return acc;
      },
      {} as { [mainVariant: string]: string[] }
    );
    const passage = parsePassage(getPassageFileContents(textId));
    const passageChars = getPassageChars(passage);

    const newCharsInPassage = [...passageChars].filter(
      (char) => !registeredChars.has(char)
    );

    const featuredChars = new Set(
      Object.keys(vocab).concat(isBrandtPassage ? newCharsInPassage : [])
    );

    for (const char of featuredChars) {
      if (
        !lexicon.vocab[char] ||
        vocab[char]?.some((e) => vocabFileColumns.some((k) => !e[k.key]))
      ) {
        const unihanResult = await getUnihan(char);
        const qieyunResult = qieyun.資料.query字頭(char);
        vocab[char] = (
          vocab[char] || [
            {
              en: null,
              jyutping: null,
              kr: null,
              pinyin: null,
              vi: null,
              qieyun: null,
            },
          ]
        ).map((e) => ({
          en: e.en || null,
          jyutping:
            e.jyutping ||
            unihanResult?.kCantonese
              ?.split(/\s/)
              .map((r, _, segments) =>
                segments.length > 1
                  ? `${convertToneNumbersToSuperscript(r)}?`
                  : convertToneNumbersToSuperscript(r)
              )

              .join(", ") ||
            null,
          pinyin:
            e.pinyin ||
            getMandarinReadings(char, unihanResult)
              .map((r, _, segments) => (segments.length > 1 ? `${r}?` : r))
              .join(", ") ||
            null,
          vi:
            e.vi ||
            unihanResult?.kVietnamese
              ?.split(/\s/)
              .map((r, _, segments) => (segments.length > 1 ? `${r}?` : r))
              .join(", ") ||
            null,
          kr:
            e.kr ||
            unihanResult?.kHangul
              ?.split(/\s/)
              .map((r) => r.split(":")[0])
              .map((r, _, segments) => (segments.length > 1 ? `${r}?` : r))
              .join(", ") ||
            null,
          qieyun:
            e.qieyun ||
            qieyunResult
              ?.map((r, _, results) =>
                results.length > 1 ? `${r.音韻地位.描述}?` : r.音韻地位.描述
              )
              .join(", ") ||
            null,
        }));
      }
    }
    const newVocabFileContents = makeVocabTsvContent(vocab, variants);

    if (
      Object.keys(vocab).length &&
      newVocabFileContents !== vocabFileContents
    ) {
      const vocabFilePath = getPassageVocabFilePath(textId);
      fs.writeFileSync(vocabFilePath, newVocabFileContents);
      if (fs.existsSync(vocabFilePath))
        console.log(`Overwrote file ${vocabFilePath}`);
      else console.log(`Created new file ${vocabFilePath}`);
    }

    if (isBrandtPassage)
      for (const char of passageChars) {
        registeredChars.add(char);
        const variants = lexicon.variants[char] || [];
        for (const mainVariant of variants) {
          registeredChars.add(mainVariant);
        }
        for (const secondaryVariant of mainToSecondaryVariants[char] || []) {
          registeredChars.add(secondaryVariant);
        }
      }
  }
}

function getPassageChars(passage: Passage) {
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
  return [...text.matchAll(/(?<=`)[^`\s\n]+(?=`)/g)].map((t) =>
    normalizeText(t[0])
  );
}

function writePassageVocabularyJsons(lexicon: PassageVocabWithVariants) {
  for (const textId of getTextsIds()) {
    const vocabFileContents = getPassageVocabFileContents(textId);
    const { vocab } = parsePassageVocabList(textId, vocabFileContents);
    const passage = parsePassage(getPassageFileContents(textId));

    const vocabJsonPath = path.join(
      prebuildDirectoryPath,
      `${textId}.vocab.json`
    );
    const passageChars = getPassageChars(passage);

    const variants: PassageTermVariants = {};
    for (const char of passageChars) {
      if (!vocab[char]) {
        vocab[char] = lexicon.vocab[char];
      }
      const mainVariants = lexicon.variants[char];
      if (mainVariants) {
        variants[char] = mainVariants;
        for (const mainVariant of mainVariants) {
          if (!vocab[mainVariant]) {
            vocab[mainVariant] = lexicon.vocab[mainVariant];
          }
        }
      }
    }

    fs.writeFileSync(
      vocabJsonPath,
      JSON.stringify({ vocab, variants }, null, 2),
      "utf-8"
    );
    console.log(`Wrote vocab for ${textId} to ${vocabJsonPath}`);
  }
}

function getMandarinReadings(
  char: string,
  unihanResult: Partial<Record<string, string>>
) {
  const kMandarin = unihanResult?.kMandarin?.split(/\s/);
  if (kMandarin?.length) return kMandarin;
  const kHanyuPinyin =
    unihanResult?.kHanyuPinyin
      ?.split(/\s/)
      .flatMap((s) => s.split(":")[1]?.split(",") || s) || [];
  return kHanyuPinyin;
}

function makeVocabTsvContent(
  vocab: Partial<Record<string, LexiconEntry[]>>,
  variants: PassageTermVariants
): string | NodeJS.ArrayBufferView {
  return [
    `Traditional\tQieyun\tHanyu Pinyin\tJyutping\tKorean\tVietnamese\tEnglish`,
    ...Object.entries(vocab).flatMap(
      ([char, ee]) =>
        ee?.map((e) => {
          const variantsForChar = getVariantsForChar(char, variants);
          const variantsString = variantsForChar?.length
            ? `,${variantsForChar.join(",")}`
            : "";
          return [
            char + variantsString,
            e.qieyun,
            e.pinyin,
            e.jyutping,
            e.kr,
            e.vi,
            e.en,
          ].join("\t");
        }) || []
    ),
  ].join("\n");
}

function getVariantsForChar(char: string, variants: PassageTermVariants) {
  const secondaryVariants: string[] = [];
  for (const secondaryVariant in variants) {
    if (variants[secondaryVariant]!.includes(char)) {
      secondaryVariants.push(secondaryVariant);
    }
  }
  return secondaryVariants;
}

export type PassageVocabWithVariants = {
  vocab: PassageVocab;
  variants: Record<string, string[]>;
};

function mergeVocab(
  a: PassageVocabWithVariants,
  b: PassageVocabWithVariants
): PassageVocabWithVariants {
  const mergedVocab: PassageVocab = { ...a.vocab };
  const mergedVariants: PassageTermVariants = { ...a.variants };
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

async function getUnihan(
  char: string
): Promise<Partial<Record<string, string>>> {
  return new Promise((res, rej) => {
    unihan.get(char, (err: any, result: any) => {
      if (err) rej(err);
      else {
        for (const key in result) {
          if (!result[key]) delete result[key];
        }
        res(result);
      }
    });
  });
}

const SUPERSCRIPT_NUMBERS = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};
function convertToneNumbersToSuperscript(string: string) {
  return string.replace(
    /([0-9])$/,
    (match, p1) => SUPERSCRIPT_NUMBERS[p1 as keyof typeof SUPERSCRIPT_NUMBERS]
  );
}
