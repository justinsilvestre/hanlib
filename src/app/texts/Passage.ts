import {
  CorpusVocab,
  CorpusTermVariants,
  LexiconEntryFieldKey,
} from "./lexicon";

export type Passage = {
  frontmatter: {
    title: string;
    description: string;
  };
  lines: {
    chinese: string;
    english: string;
    gloss: string | null;
  }[];
  notes: Record<string, string>;
};

export const vocabFileColumns = [
  { heading: "Vietnamese", key: "vi" },
  { heading: "Jyutping", key: "jyutping" },
  { heading: "English", key: "en" },
  { heading: "Hanyu Pinyin", key: "pinyin" },
  { heading: "Korean", key: "kr" },
  { heading: "Qieyun", key: "qieyun" },
] as const satisfies { heading: string; key: LexiconEntryFieldKey }[];

export function parsePassageVocabListTsv(
  textId: string,
  vocabFileContents: string | null
) {
  const vocab: CorpusVocab = {};
  const variants: CorpusTermVariants = {};
  let comment: string | null = null;

  if (vocabFileContents) {
    const [, commentText, body] =
      vocabFileContents?.match(/^(#.*\n)?([\s\S]*)$/) || [];
    comment = commentText || null;

    const lines = body.split("\n");

    const [, ...columnHeaders] = lines[0].trim().split("\t");
    const invalidColumnHeaders = columnHeaders.filter(
      (columnHeader) =>
        !vocabFileColumns.some(
          (vocabFileColumn) => vocabFileColumn.heading === columnHeader
        )
    );
    if (invalidColumnHeaders.length) {
      console.log(vocabFileContents);
      throw new Error(
        `Invalid vocab file for ${textId} (invalid column headers: "${invalidColumnHeaders.join(
          ", "
        )}" should be one of ${vocabFileColumns
          .map((vocabFileColumn) => vocabFileColumn.heading)
          .join(", ")})`
      );
    }

    const columnsOrder: { key: LexiconEntryFieldKey; index: number }[] =
      vocabFileColumns.map((vocabFileColumn) => {
        const index = columnHeaders.indexOf(vocabFileColumn.heading);
        return { key: vocabFileColumn.key, index };
      });

    for (const rawLine of lines.slice(1)) {
      const line = rawLine.trim();
      const [chinese, ...columns] = line.split("\t");
      const vocabEntry = {} as Record<LexiconEntryFieldKey, string | null>;
      for (const { key, index } of columnsOrder) {
        const value = columns[index];
        vocabEntry[key] = value || null;
      }

      const chineseVariants = chinese.split(",");
      const [mainVariant, ...secondaryVariants] = chineseVariants;

      vocab[mainVariant] ||= [];
      vocab[mainVariant]!.push(vocabEntry);
      for (const variant of secondaryVariants) {
        variants[variant] ||= [];
        variants[variant].push(mainVariant);
      }
    }
  }
  return { vocab, variants, comment };
}

export function parsePassage(passageFileContents: string) {
  const sections = passageFileContents.split(/\n---+\n/);
  if (sections.length < 2)
    throw new Error("Invalid passage file " + passageFileContents);
  const [frontmatterText, body, notesText] = sections;
  const lines = body
    .trim()
    .split(/\n\n+/)
    .map((line) => {
      const [chinese, english = "", gloss = ""] = line.split("\n");
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

  const text: Passage = {
    frontmatter: parseFrontmatterText(frontmatterText),
    lines,
    notes,
  };
  return text;
}
export function parseFrontmatterText(frontmatterText: string) {
  const lines = frontmatterText.split("\n");
  return {
    title: lines[0].replace("# ", ""),
    description: lines.slice(1).join("\n"),
  };
}
