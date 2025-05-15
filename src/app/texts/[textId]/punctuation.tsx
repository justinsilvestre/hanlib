const punctuationRegex =
  /[。，？！；：、「」『』（）《》〈〉﹁﹂﹃﹄【】〔〕a-zA-Z\s0-9①-⑳㉑-㊿\-:{}\,;\.()]+/;
const endPunctuationRegex = /[。？！、:\,;\.]/;

export function normalizeText(text: string) {
  return text.replaceAll(
    /[。，？！；：、「」『』（）《》〈〉﹁﹂﹃﹄【】〔〕a-zA-Z\s0-9①-⑳㉑-㊿\-:{}\,;\.()]+/g,
    ""
  );
}

export function textIsPunctuation(text: string) {
  return punctuationRegex.test(text);
}

export function textIsEndPunctuation(text: string) {
  return endPunctuationRegex.test(text.trim()[0]);
}
