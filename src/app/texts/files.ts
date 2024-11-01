import fs from "fs";
import path from "path";

import { Passage as Passage, PassageVocab } from "./Passage";
import { parsePassage, parseFrontmatterText } from "./Passage";
import { PassageVocabWithVariants } from "../prebuild";

const textsDirectory = path.resolve(process.cwd(), "texts");

export const getPassageFileContents = (textId: string) => {
  const passageFilePath = path.resolve(textsDirectory, `${textId}.passage.md`);
  return fs.readFileSync(passageFilePath, "utf8");
};

export const getPassageVocabFilePath = (textId: string) =>
  path.resolve(textsDirectory, `${textId}.vocab.tsv`);
export const getPassageVocabFileContents = (textId: string) => {
  const vocabFilePath = getPassageVocabFilePath(textId);
  return fs.existsSync(vocabFilePath)
    ? fs.readFileSync(vocabFilePath, "utf8")
    : null;
};
export function getPassageVocab(textId: string) {
  const vocabJsonPath = path.resolve(
    process.cwd(),
    "prebuild",
    `${textId}.vocab.json`
  );
  const vocab: PassageVocabWithVariants = JSON.parse(
    fs.readFileSync(vocabJsonPath, "utf8")
  );
  return vocab;
}

export const getPassage = (textId: string) => {
  const passageFileContents = getPassageFileContents(textId);
  const passage: Passage = parsePassage(passageFileContents);

  const vocab = getPassageVocab(textId);

  return { text: passage, vocab };
};

export function getTextsIds() {
  const filenames = fs.readdirSync(textsDirectory);
  const textIds = filenames
    .filter((filename) => filename.endsWith(".passage.md"))
    .map((filename) => filename.replace(/\.passage\.md$/, ""));
  return textIds;
}

export function getTextsIdsAndTitles() {
  const filenames = fs.readdirSync(textsDirectory);
  const textIdsAndTitles = filenames
    .filter((filename) => filename.endsWith(".passage.md"))
    .map((filename) => {
      const textId = filename.replace(/\.passage\.md$/, "");
      const passageFileContents = fs.readFileSync(
        path.resolve(textsDirectory, filename),
        "utf8"
      );
      const title = parseFrontmatterText(passageFileContents).title;
      let firstLine = "";
      try {
        firstLine = parsePassage(passageFileContents).lines[0]?.chinese || "";
      } catch (err) {
        console.error(`Error parsing passage ${textId}`);
        console.error(err);
      }
      return {
        textId,
        title,
        preview:
          firstLine.length > 7 ? firstLine.slice(0, 7) + "..." : firstLine,
      };
    });
  return textIdsAndTitles;
}
export const prebuildDirectoryPath = path.join(process.cwd(), "prebuild");
export const lexiconFilePath = path.join(prebuildDirectoryPath, "lexicon.json");
export const getLexiconFileContents = () => {
  return JSON.parse(
    fs.readFileSync(lexiconFilePath, "utf8")
  ) as PassageVocabWithVariants;
};
