import { getTextsIds, getPassage } from "../files";

import TextPage from "./TextPage";
export async function generateStaticParams() {
  const textIds = getTextsIds();
  return textIds.map((textId) => ({ textId: textId }));
}

export default async function TextRoute(
  props: {
    params: Promise<{ textId: string }>;
  }
) {
  const params = await props.params;

  const {
    textId
  } = params;

  const { text, vocab } = await getPassage(textId);

  return <TextPage passageId={textId} passage={text} vocab={vocab} />;
}
