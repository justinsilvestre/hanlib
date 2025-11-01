import * as fs from "fs";
import { prebuildDirectoryPath, lexiconFilePath } from "../texts/files";
import { aggregateVocabulary } from "./aggregateVocabulary";
import { fillInMissingReadingsInTsvs } from "./fillInMissingReadingsInTsvs";
import { writePassageVocabularyJsons } from "./writePassageVocabularyJsons";

const startTime = Date.now();

if (!fs.existsSync(prebuildDirectoryPath)) {
  fs.mkdirSync(prebuildDirectoryPath);
}

console.log(`Aggregating vocabulary...`);
const lexicon = aggregateVocabulary();
console.log(
  `Aggregated vocabulary in ${(Date.now() - startTime) / 1000} seconds`
);

console.log(`Filling in missing readings in passage vocab tsvs...`);

fillInMissingReadingsInTsvs(lexicon).then(() => {
  console.log(
    `Filled in missing readings in ${(Date.now() - startTime) / 1000} seconds`
  );
  fs.writeFileSync(lexiconFilePath, JSON.stringify(lexicon, null, 2));
  console.log(`Wrote lexicon to ${lexiconFilePath}`);
  writePassageVocabularyJsons(lexicon);
  console.log(`Done writing vocab jsons`);
  const termsCount = Object.keys(lexicon.vocab).length;
  const charactersCount = Object.keys(lexicon.vocab).reduce(
    (count, term) => count + (term.length === 1 ? 1 : 0),
    0
  );

  console.log(`Finished in ${(Date.now() - startTime) / 1000} seconds`);

  console.log(`Total terms: ${termsCount}`);
  console.log(`Total characters: ${charactersCount}`);
});
