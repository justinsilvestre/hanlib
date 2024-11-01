import * as fs from "fs";
import { prebuildDirectoryPath, lexiconFilePath } from "../texts/files";
import { aggregateVocabulary } from "./aggregateVocabulary";
import { fillInMissingReadingsInTsvs } from "./fillInMissingReadingsInTsvs";
import { writePassageVocabularyJsons } from "./writePassageVocabularyJsons";

if (!fs.existsSync(prebuildDirectoryPath)) {
  fs.mkdirSync(prebuildDirectoryPath);
}

const lexicon = aggregateVocabulary();

fillInMissingReadingsInTsvs(lexicon).then(() => {
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
