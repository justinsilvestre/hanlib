"use client";

import {
  FloatingArrow,
  FloatingFocusManager,
  FloatingPortal,
} from "@floating-ui/react";
import { PassageVocab, VocabEntryPronunciationKey } from "../Passage";
import { usePopover } from "./Popover";
import { useState } from "react";
import { textIsPunctuation } from "./punctuation";
import {
  findEntryMatchingEnKeywords,
  toEnMatchKeyword,
} from "@/app/lexiconEntryEnKeywords";
import dynamic from "next/dynamic";
import { GlossDocument, GlossedTermComponent } from "@/app/glossUtils";
import { PassageVocabWithVariants } from "@/app/prebuild";

const RubyText = dynamic(() => import("./RubyText").then((r) => r.RubyText), {
  ssr: false,
});

export const LATEST_DISPLAY_OPTIONS_VERSION = 1;

export type DisplayOptions = {
  ruby: null | VocabEntryPronunciationKey;
  translation: null | "gloss" | "idiomatic";
  qieyun?:
    | "karlgren"
    | "pan"
    | "pulleyblank-emc"
    | "pulleyblank-lmc"
    | "decorated-onyomi";
  version: number;
};

export function ChineseWithPopover({
  text,
  vocab,
  displayOptions,
  gloss,
  highlightedCharactersRange,
  setHighlightedCharactersRange,
  segmentStartingCharacterIndexInLine,
}: {
  text: string;
  vocab: PassageVocabWithVariants;
  displayOptions: DisplayOptions;
  gloss: GlossDocument | null;
  highlightedCharactersRange?: {
    startCharacterIndex: number;
    endCharacterIndex: number;
  } | null;
  setHighlightedCharactersRange?: (
    range: { startCharacterIndex: number; endCharacterIndex: number } | null
  ) => void;
  segmentStartingCharacterIndexInLine?: number;
}) {
  const popover = usePopover();
  const [popoverChar, setChar] = useState<string | null>(null);
  const [popoverCharGloss, setCharGloss] = useState<string | null>(null);

  let glossedChars = 0;

  const { components: termComponents, indexes: termComponentsIndexes } =
    gloss?.getTermComponents() || {
      components: [],
      indexes: new Map<GlossedTermComponent, number>(),
    };

  return (
    <span className="relative">
      {Array.from(text, (char, i) => {
        const isExpectedInGloss = !textIsPunctuation(char);
        const glossIndex = glossedChars;
        glossedChars += isExpectedInGloss ? 1 : 0;

        const id = `text-${char}-${i}`;

        const characterIndexInLine =
          segmentStartingCharacterIndexInLine != null
            ? segmentStartingCharacterIndexInLine + glossIndex
            : null;
        const characterIsHighlighted =
          highlightedCharactersRange != null &&
          characterIndexInLine != null &&
          characterIndexInLine >=
            highlightedCharactersRange.startCharacterIndex &&
          characterIndexInLine <= highlightedCharactersRange.endCharacterIndex;
        const entries = lookUpChar(vocab, char);

        if (!entries?.length) {
          return (
            <span key={i} className={`font-sans `}>
              {char}
            </span>
          );
        }

        const characterGloss =
          characterIndexInLine != null
            ? termComponents?.[characterIndexInLine]
            : null;
        const glossLemma = characterGloss?.term.getLemma() || null;

        const highlightRange = characterGloss
          ? {
              startCharacterIndex: termComponentsIndexes.get(
                characterGloss.parent.components[0]
              )!,
              endCharacterIndex: termComponentsIndexes.get(
                characterGloss.parent.components[
                  characterGloss.parent.components.length - 1
                ]
              )!,
            }
          : null;

        const soleEntry = entries.length === 1 ? entries[0] : null;
        const matchingEntry = glossLemma
          ? findEntryMatchingEnKeywords(entries, [glossLemma])
          : null;

        let rubyText: string | null = null;
        if (displayOptions.ruby === "en" && glossLemma) rubyText = glossLemma;
        else
          rubyText =
            displayOptions?.ruby &&
            (matchingEntry || soleEntry || entries.length)
              ? (matchingEntry || soleEntry || entries[0])?.[
                  displayOptions.ruby!
                ]
              : null;

        const className = `relative cursor:pointer hovers:bg-yellow-400/40 ${
          characterIsHighlighted ? "bg-blue-400/40" : ""
        }`;
        return (
          <span
            key={i}
            className={`relative cursor:pointer hover:bg-yellow-400/40 ${
              characterIsHighlighted ? "bg-blue-400/40" : ""
            }`}
            {...popover.getReferenceProps({
              className: `${className} ${
                popover.refs.domReference.current?.id === id
                  ? "bg-blue-500/20"
                  : ""
              }`,
              onClick: (e) => {
                popover.refs.setReference(e.currentTarget);
                setChar(char);
                setCharGloss(glossLemma);
              },
              onMouseEnter:
                setHighlightedCharactersRange && highlightRange
                  ? () => setHighlightedCharactersRange(highlightRange)
                  : undefined,
            })}
            onMouseLeave={
              setHighlightedCharactersRange
                ? () => setHighlightedCharactersRange?.(null)
                : undefined
            }
          >
            <ruby>
              <span className="font-brush">{char}</span>
              <RubyText
                enGloss={glossLemma}
                char={char}
                soleEntry={soleEntry}
                matchingEntry={matchingEntry || null}
                displayOptions={displayOptions}
                firstEntry={entries[0] || null}
              />
            </ruby>
          </span>
        );
      })}
      {popover.open &&
        popoverChar &&
        lookUpChar(vocab, popoverChar)?.length && (
          <PopoverDictionaryContent
            popover={popover}
            popoverChar={popoverChar}
            vocab={vocab}
            enGloss={popoverCharGloss}
          />
        )}
    </span>
  );
}

function PopoverDictionaryContent({
  popover,
  popoverChar,
  vocab,
  enGloss,
}: {
  popover: ReturnType<typeof usePopover>;
  popoverChar: string;
  vocab: PassageVocabWithVariants;
  enGloss: string | null;
}) {
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
              lookUpChar(vocab, popoverChar)?.map((entry, i, entries) => {
                const enDefinitionSegmentsCount =
                  entry.en?.split(/[,;]/).length || 0;

                return (
                  <div key={i} className="p-1 rounded">
                    {[entry.jyutping, entry.pinyin, entry.kr, entry.vi]
                      .filter((e) => e)
                      .map((e, i, readings) => (
                        <span key={i}>
                          <b>{e}</b>
                          {i < readings.length - 1 ? " / " : " "}
                        </span>
                      ))}
                    <span className="">
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

function lookUpChar(
  { vocab, variants }: PassageVocabWithVariants,
  char: string
) {
  const exactMatch = vocab[char];
  if (exactMatch) return exactMatch;
  const mainVariantsForChar = variants[char];
  if (mainVariantsForChar) {
    const entries = mainVariantsForChar.flatMap(
      (variant) => vocab[variant] || []
    );
    return entries;
  }
}
