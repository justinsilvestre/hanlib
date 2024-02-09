import { getTextsIds, getText } from "../files";

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
  const { text, vocab } = await getText(textId);

  return <TextPage text={text} vocab={vocab} />;
}
