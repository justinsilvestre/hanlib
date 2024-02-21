const punctuationRegex =
  /[。，？！；：、「」『』（）《》〈〉﹁﹂﹃﹄【】〔〕a-zA-Z\s0-9①-⑳-㊿\-:{}\,;\.()]+/;
const punctuationRegexG =
  /[。，？！；：、「」『』（）《》〈〉﹁﹂﹃﹄【】〔〕a-zA-Z\s0-9①-⑳-㊿\-:{}\,;\.()]+/g;

export function normalizeText(text: string) {
  return text.replaceAll(punctuationRegexG, "");
}

export function textIsPunctuation(text: string) {
  return punctuationRegex.test(text);
}
