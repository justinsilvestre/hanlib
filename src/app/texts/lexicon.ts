export type LexiconEntry = Record<LexiconEntryFieldKey, string | null> & {
  head: string;
};

export type LexiconJson = {
  vocab: CorpusVocab;
  variants: CorpusTermVariants;
};

export type CorpusTermVariants = Record<string, string[]>;
export type CorpusVocab = Partial<Record<string, LexiconEntry[]>>;

export type LexiconEntryFieldKey =
  | "vi"
  | "jyutping"
  | "pinyin"
  | "en"
  | "kr"
  | "qieyun";
