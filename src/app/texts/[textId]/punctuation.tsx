const punctuationRegex =
  /。|，|？|！|；|：|、|「|」|『|』|（|）|《|》|〈|〉|﹁|﹂|﹃|﹄|【|】|〔|〕/g;

export function normalizeText(text: string) {
  return text.replaceAll(punctuationRegex, "");
}

export function textIsPunctuation(text: string) {
  return punctuationRegex.test(text);
}
