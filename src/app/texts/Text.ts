export type Text = {
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
export type TextVocab = Record<string, { en: string; vi: string }[]>;
