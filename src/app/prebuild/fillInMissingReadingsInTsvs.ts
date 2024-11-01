import fs from "fs";
import * as qieyun from "qieyun";
import {
  getTextsIds,
  getPassageVocabFileContents,
  getPassageFileContents,
  getPassageVocabFilePath,
} from "../texts/files";
import {
  parsePassageVocabListTsv,
  parsePassage,
  vocabFileColumns,
} from "../texts/Passage";
import {
  LexiconJson,
  LexiconEntry,
  CorpusTermVariants,
} from "../texts/lexicon";
import { getPassageChars } from "./getPassageChars";
// @ts-expect-error no typings
import unihan from "@silvestre/cjk-unihan";

export async function fillInMissingReadingsInTsvs(lexicon: LexiconJson) {
  let brandtPassagesVisited = 0;
  let registeredChars = new Set<string>();
  for (const textId of getTextsIds()) {
    const isBrandtPassage = textId.startsWith("brandt-");
    if (isBrandtPassage) brandtPassagesVisited += 1;
    const vocabFileContents = getPassageVocabFileContents(textId);

    const { vocab, variants, comment } = parsePassageVocabListTsv(
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

    const featuredCharsMainVariants = new Set(
      [...featuredChars].flatMap((char) => {
        const mainVariants = [
          ...(lexicon.variants[char] || []),
          ...(variants[char] || []),
        ];
        return mainVariants.length ? mainVariants : [char];
      })
    );
    for (const char of featuredCharsMainVariants) {
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
    const newVocabFileContents = makeVocabTsvContent(comment, vocab, variants);

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
  comment: string | null,
  vocab: Partial<Record<string, LexiconEntry[]>>,
  variants: CorpusTermVariants
): string | NodeJS.ArrayBufferView {
  return [
    ...(comment ? [comment.trim()] : []),
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

function getVariantsForChar(char: string, variants: CorpusTermVariants) {
  const secondaryVariants: string[] = [];
  for (const secondaryVariant in variants) {
    if (variants[secondaryVariant]!.includes(char)) {
      secondaryVariants.push(secondaryVariant);
    }
  }
  return secondaryVariants;
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
