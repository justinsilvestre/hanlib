import { getTextsIds, getPassage, lexiconFilePath } from "@/app/texts/files";
import { readFile } from "fs/promises";
import { Passage, PassageVocab } from "../texts/Passage";
import { ContributePage } from "./ContributePage";

export default async function ContributeRoute() {
  const lexicon = JSON.parse(
    await readFile(lexiconFilePath, "utf-8")
  ) as PassageVocab;

  return <ContributePage lexicon={lexicon} />;
}
