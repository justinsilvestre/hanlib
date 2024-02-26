import {
  getPassageFileContents,
  getPassageVocab,
  getTextsIds,
} from "@/app/texts/files";
import { ContributePage } from "@/app/contribute/ContributePage";

export async function generateStaticParams() {
  const textIds = getTextsIds();
  return textIds.map((textId) => ({ textId: textId }));
}
export default async function ContributeRoute({
  params: { textId },
}: {
  params: { textId: string };
}) {
  const text = await getPassageFileContents(textId);
  const vocab = await getPassageVocab(textId);
  return (
    <ContributePage initialText={text} lexicon={vocab} passageId={textId} />
  );
}
