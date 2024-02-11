"use client";

import {
  FloatingArrow,
  FloatingFocusManager,
  FloatingPortal,
} from "@floating-ui/react";
import { PassageVocab } from "../Passage";
import { usePopover } from "./Popover";
import { useState } from "react";
import { textIsPunctuation } from "./punctuation";
import {
  findEntryMatchingEnKeywords,
  toEnMatchKeyword,
} from "@/app/lexiconEntryEnKeywords";

export type DisplayOptions = {
  ruby: null | "en" | "vi" | "jyutping" | "pinyin";
  translation: boolean;
};

export function ChineseWithPopover({
  text,
  vocab,
  displayOptions,
  gloss,
}: {
  text: string;
  vocab: PassageVocab;
  displayOptions: DisplayOptions;
  gloss: string[] | null;
}) {
  const popover = usePopover();
  const [popoverChar, setChar] = useState<string | null>(null);
  const [popoverCharGloss, setCharGloss] = useState<string | null>(null);

  let glossedChars = 0;

  return (
    <span className="relative">
      {Array.from(text, (char, i) => {
        const isExpectedInGloss = !textIsPunctuation(char);
        const glossIndex = glossedChars;
        glossedChars += isExpectedInGloss ? 1 : 0;

        const id = `text-${char}-${i}`;

        const entries = vocab[char];

        if (!entries?.length) {
          return <span key={i}>{char}</span>;
        }

        const enGloss = gloss?.[glossIndex]?.replace(/_/g, " ") || null;

        const soleEntry = entries.length === 1 ? entries[0] : null;

        const matchingEntry = enGloss
          ? findEntryMatchingEnKeywords(entries, [enGloss])
          : null;

        let rubyText: string | null = null;
        if (displayOptions.ruby === "en") rubyText = enGloss;
        else
          rubyText =
            displayOptions?.ruby &&
            (matchingEntry || soleEntry || entries.length)
              ? (matchingEntry || soleEntry || entries[0])?.[
                  displayOptions.ruby!
                ]
              : null;
        const className = `relative cursor:pointer hover:bg-yellow-400/40`;
        return (
          <span
            key={i}
            className="relative cursor:pointer hover:bg-yellow-400/40"
            {...popover.getReferenceProps({
              className: `${className} ${
                popover.refs.domReference.current?.id === id
                  ? "bg-blue-500/20"
                  : ""
              }`,
              onClick: (e) => {
                popover.refs.setReference(e.currentTarget);
                setChar(char);
                setCharGloss(enGloss);
              },
            })}
          >
            {rubyText ? (
              <ruby id={id}>
                {char}
                <rt className="text-[0.40em] mr-[0.40em]">
                  {rubyText}
                  {!soleEntry && !matchingEntry ? "*" : ""}
                </rt>
              </ruby>
            ) : (
              char
            )}
          </span>
        );
      })}
      {popover.open &&
        popoverChar &&
        vocab[popoverChar] &&
        PopoverDictionaryContent(popover, popoverChar, vocab, popoverCharGloss)}
    </span>
  );
}

function PopoverDictionaryContent(
  popover: ReturnType<typeof usePopover>,
  popoverChar: string,
  vocab: PassageVocab,
  enGloss: string | null
) {
  return (
    <FloatingPortal>
      <FloatingFocusManager context={popover.context} modal={popover.modal}>
        <div
          ref={popover.refs.setFloating}
          style={{
            ...popover.floatingStyles,
            filter: "drop-shadow(1px 1px 2px rgb(var(--foreground-rgb) / 0.4))",
          }}
          aria-labelledby={popover.labelId}
          aria-describedby={popover.descriptionId}
          {...popover.getFloatingProps()}
        >
          <FloatingArrow
            ref={popover.arrowRef}
            context={popover.context}
            style={{
              fill: "rgba(var(--background-rgb))",
            }}
            fill="blue"
          />
          <div className="bg-background max-w-[10rem]">
            {popoverChar &&
              vocab[popoverChar]?.map((entry, i, entries) => {
                const enDefinitionSegmentsCount =
                  entry.en?.split(/[,;]/).length || 0;

                return (
                  <div key={i} className="p-1 rounded">
                    {[entry.jyutping, entry.pinyin, entry.vi]
                      .filter((e) => e)
                      .map((e, i, readings) => (
                        <span key={i}>
                          <b>{e}</b>
                          {i < readings.length - 1 ? " / " : " "}
                        </span>
                      ))}
                    <span className="text-sm">
                      {entry.en
                        ?.split("; ")
                        .map(
                          (semicolonSegment, semicolonI, semicolonSegments) => {
                            const commaSegments = semicolonSegment.split(", ");
                            return (
                              <span key={semicolonSegment}>
                                {commaSegments.map(
                                  (commaSegment, commaI, commaSegments) => {
                                    const segmentKeyword =
                                      toEnMatchKeyword(commaSegment);

                                    return (
                                      <span
                                        key={commaSegment}
                                        className={`${
                                          segmentKeyword === enGloss &&
                                          enDefinitionSegmentsCount > 1
                                            ? "bg-yellow-400/10 border-yellow-400/50 border text-foreground"
                                            : ""
                                        }`}
                                      >
                                        {commaSegment}
                                        {commaI < commaSegments.length - 1
                                          ? ", "
                                          : ""}
                                      </span>
                                    );
                                  }
                                )}
                                {semicolonI < semicolonSegments.length - 1
                                  ? "; "
                                  : ""}
                              </span>
                            );
                          }
                        )}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  );
}
