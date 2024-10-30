import { lexiconFilePath } from "@/app/texts/files";
import { readFile } from "fs/promises";
import { ContributePage } from "./ContributePage";
import { PassageVocabWithVariants } from "../prebuild";

export default async function ContributeRoute() {
  const lexicon = JSON.parse(
    await readFile(lexiconFilePath, "utf-8")
  ) as PassageVocabWithVariants;

  return <ContributePage lexicon={lexicon} />;
}
