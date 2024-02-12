"use client";
import { LexiconEntry } from "../Passage";
import { DisplayOptions } from "./ChineseWithPopover";

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
  if (!globalThis.window)
    throw new Promise((res) => {
      if (globalThis.window) res(null);
    });
  let rubyText: string | undefined | null = null;
  if (displayOptions.ruby === "en") rubyText = enGloss;
  else
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
