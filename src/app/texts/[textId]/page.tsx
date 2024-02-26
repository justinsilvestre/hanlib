import { getTextsIds, getPassage } from "../files";

import TextPage from "./TextPage";
export async function generateStaticParams() {
  const textIds = getTextsIds();
  return textIds.map((textId) => ({ textId: textId }));
}

export default async function TextRoute({
  params: { textId },
}: {
  params: { textId: string };
}) {
  const { text, vocab } = await getPassage(textId);

  return <TextPage passageId={textId} passage={text} vocab={vocab} />;
}
