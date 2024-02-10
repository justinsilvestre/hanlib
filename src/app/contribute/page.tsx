import { getTextsIds, getPassage } from "@/app/texts/files";
import TextPage from "../texts/[textId]/TextPage";

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

  return <TextPage text={text} vocab={vocab} />;
}
