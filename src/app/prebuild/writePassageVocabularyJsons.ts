import fs from "fs";
import path from "path";
import {
  getTextsIds,
  getPassageVocabFileContents,
  getPassageFileContents,
  prebuildDirectoryPath,
} from "../texts/files";
import { LexiconJson, CorpusTermVariants } from "../texts/lexicon";
import { parsePassageVocabListTsv, parsePassage } from "../texts/Passage";
import { getPassageChars } from "./getPassageChars";

export function writePassageVocabularyJsons(lexicon: LexiconJson) {
  for (const textId of getTextsIds()) {
    const vocabFileContents = getPassageVocabFileContents(textId);
    const { vocab, variants: _passageVariants } = parsePassageVocabListTsv(
      textId,
      vocabFileContents
    );
    const passage = parsePassage(getPassageFileContents(textId));

    const vocabJsonPath = path.join(
      prebuildDirectoryPath,
      `${textId}.vocab.json`
    );
    const passageChars = getPassageChars(passage);

    const variants: CorpusTermVariants = {};
    for (const char of passageChars) {
      vocab[char] ||= lexicon.vocab[char];
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
