const punctuationRegex =
  /[。，？！；：、「」『』（）《》〈〉﹁﹂﹃﹄【】〔〕]+/;
const punctuationRegexG =
  /[。，？！；：、「」『』（）《》〈〉﹁﹂﹃﹄【】〔〕]+/g;

export function normalizeText(text: string) {
  return text.replaceAll(punctuationRegexG, "");
}

export function textIsPunctuation(text: string) {
  return punctuationRegex.test(text);
}
