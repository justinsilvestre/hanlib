"use client";
import { LexiconEntry } from "../Passage";
import { DisplayOptions } from "./ChineseWithPopover";
import { transcribe as transcribeDecoratedKanOn } from "../../qieyun/transcribeDecoratedKanOn";
import { transcribe as transcribeKarlgren } from "../../qieyun/transcribeKarlgren";
import { getQysTranscriptionProfile } from "@/app/qieyun/QysTranscriptionProfile";

export function RubyText({
  char,
  enGloss,
  displayOptions,
  soleEntry,
  matchingEntry,
  firstEntry,
}: {
  char: string;
  enGloss: string | null;
  displayOptions: DisplayOptions;
  soleEntry: LexiconEntry | null;
  matchingEntry: LexiconEntry | null;
  firstEntry: LexiconEntry | null;
}) {
  let rubyText: string | undefined | null = null;
  if (displayOptions.ruby === "en") rubyText = enGloss;
  else if (displayOptions.ruby === "qieyun") {
    const entry = (matchingEntry || soleEntry || firstEntry)?.qieyun;
    try {
      const transcriptions =
        entry &&
        entry.split(/, */).map((p) => {
          const profile = getQysTranscriptionProfile(p.replace(/\?/g, ""));
          return `${
            displayOptions.qieyun === "karlgren"
              ? transcribeKarlgren(profile)
              : transcribeDecoratedKanOn(profile)
          }${p.endsWith("?") ? "?" : ""}`;
        });
      if (transcriptions) {
        rubyText = transcriptions.join(", ");
      }
    } catch (e) {
      console.error(e);
    }
  } else
    rubyText =
      displayOptions?.ruby && (matchingEntry || soleEntry || firstEntry)
        ? (matchingEntry || soleEntry || firstEntry)?.[displayOptions.ruby!]
        : null;

  return rubyText ? (
    <rt className="text-[0.40em] mr-[0.40em]">
      {rubyText}
      {!soleEntry && !matchingEntry ? "*" : ""}
    </rt>
  ) : null;
}
