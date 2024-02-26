"use client";
import { PassageVocab } from "../Passage";
import { ChineseWithPopover, DisplayOptions } from "./ChineseWithPopover";
import { GlossDocument } from "@/app/glossUtils";

export function NotesChinese({
  children,
  vocab,
  displayOptions,
  gloss,
}: {
  children: string;
  vocab: PassageVocab;
  displayOptions: DisplayOptions;
  gloss: GlossDocument | null;
}) {
  return (
    <span className="text-3xl">
      <ChineseWithPopover
        text={children}
        vocab={vocab}
        displayOptions={displayOptions}
        gloss={gloss}
      />
    </span>
  );
}
