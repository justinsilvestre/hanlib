import fs from "fs";
import path from "path";

import { Text, TextVocab } from "./Text";

const textsDirectory = path.resolve(process.cwd(), "texts");
export const getText = (textId: string) => {
  console.log("getting page");
  const passageFileContents = path.resolve(
    textsDirectory,
    `${textId}.passage.md`
  );
  const [frontmatterText, body, notesText] = fs
    .readFileSync(passageFileContents, "utf8")
    .split(/\s*\n\s*---+\s*\n\s*/);
  const lines = body.split(/\n\n+/).map((line) => {
    const [chinese, english, gloss] = line.split("\n");
    return {
      chinese,
      english,
      gloss: gloss || null,
    };
  });
  const notes: Record<string, string> = {};
  if (notesText) {
    const noteSections = [
      ...notesText.trim().matchAll(/# ([a-z])\s*\n\n([^#]+)(?=# |$)/g),
    ];
    for (const [_, noteId, noteText] of noteSections) {
      notes[noteId] = noteText;
    }
  }

  const vocabFilepath = path.resolve(textsDirectory, `${textId}.vocab.tsv`);
  const vocabFileContents = fs.existsSync(vocabFilepath)
    ? fs.readFileSync(vocabFilepath, "utf8")
    : null;
  const vocab: TextVocab = {};
  if (vocabFileContents) {
    const lines = vocabFileContents.split("\n").slice(1);
    for (const line of lines) {
      const [chinese, vi, en] = line.split("\t");
      vocab[chinese] ||= [];
      vocab[chinese].push({ en, vi });
    }
  }
  const text: Text = {
    frontmatter: parseFrontmatterText(frontmatterText),
    lines,
    notes,
  };
  return { text, vocab };
};

function parseFrontmatterText(frontmatterText: string) {
  const lines = frontmatterText.split("\n");
  return {
    title: lines[0].replace("# ", ""),
    description: lines.slice(1).join("\n"),
  };
}

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
      return { textId, title };
    });
  return textIdsAndTitles;
}
