"use client";
import { LexiconEntry } from "../lexicon";
import { DisplayOptions } from "./ChineseWithPopover";
import { transcribe as transcribeDecoratedKanOn } from "../../qieyun/transcribeDecoratedKanOn";
import { transcribe as transcribeKarlgren } from "../../qieyun/transcribeKarlgren";
import { transcribe as transcribePanWuyun } from "../../qieyun/transcribePanWuyun";
import { transcribe as transcribePulleyblank } from "../../qieyun/transcribePulleyblank";
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

          const suffix = p.endsWith("?") ? "?" : "";
          if (
            !displayOptions.qieyun ||
            displayOptions.qieyun === "decorated-onyomi"
          )
            return transcribeDecoratedKanOn(profile) + suffix;
          if (displayOptions.qieyun === "karlgren")
            return transcribeKarlgren(profile) + suffix;
          if (displayOptions.qieyun === "pan")
            return transcribePanWuyun(profile) + suffix;
          if (displayOptions.qieyun === "pulleyblank-emc")
            return transcribePulleyblank(profile, { period: "emc" }) + suffix;
          if (displayOptions.qieyun === "pulleyblank-lmc")
            return transcribePulleyblank(profile, { period: "lmc" }) + suffix;
          return transcribeDecoratedKanOn(profile);
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
