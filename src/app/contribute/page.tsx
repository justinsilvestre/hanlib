import { lexiconFilePath } from "@/app/texts/files";
import { readFile } from "fs/promises";
import { ContributePage } from "./ContributePage";
import { LexiconJson } from "../texts/lexicon";

export default async function ContributeRoute() {
  const lexicon = JSON.parse(
    await readFile(lexiconFilePath, "utf-8")
  ) as LexiconJson;

  return <ContributePage lexicon={lexicon} />;
}
