"use client";

import { Passage } from "../Passage";
import { PassageBody } from "./PassageBody";
import { PassageFrontmatter } from "./PassageFrontmatter";
import { PassageDisplayOptionsForm } from "./PassageDisplayOptionsForm";
import { useDisplayOptions } from "./PassageDisplayOptionsForm";
import Link from "next/link";
import { LexiconJson } from "@/app/texts/lexicon";

export default function TextPage({
  passageId,
  passage,
  vocab,
}: {
  passageId: string;
  passage: Passage;
  vocab: LexiconJson;
}) {
  const [displayOptions, setDisplayOptions] = useDisplayOptions();

  return (
    <main className="flex min-h-screen flex-col max-w-xl m-auto p-4">
      <PassageFrontmatter
        text={passage}
        vocab={vocab}
        displayOptions={displayOptions}
      />
      <PassageDisplayOptionsForm
        displayOptions={displayOptions}
        setDisplayOptions={setDisplayOptions}
      />
      <PassageBody
        passageId={passageId}
        passage={passage}
        vocab={vocab}
        displayOptions={displayOptions}
      />
      <Link href={`/texts/${passageId}/source`}>gloss source</Link>
    </main>
  );
}
