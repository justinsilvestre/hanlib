"use client";

import {
  FloatingArrow,
  FloatingFocusManager,
  FloatingPortal,
} from "@floating-ui/react";
import { LexiconEntryFieldKey, LexiconJson } from "../lexicon";
import { usePopover } from "./Popover";
import { useState } from "react";
import { textIsPunctuation } from "./punctuation";
import {
  findEntryMatchingEnKeywords,
  toEnMatchKeyword,
} from "@/app/lexiconEntryEnKeywords";
import dynamic from "next/dynamic";
import { GlossDocument, GlossedTermComponent } from "@/app/glossUtils";

const RubyText = dynamic(() => import("./RubyText").then((r) => r.RubyText), {
  ssr: false,
});

export const LATEST_DISPLAY_OPTIONS_VERSION = 1;

export type DisplayOptions = {
  ruby: null | LexiconEntryFieldKey;
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
  vocab: LexiconJson;
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
  const lookups = getLookups(text, vocab);

  const popover = usePopover();
  const [popoverCharIndex, setCharIndex] = useState<number | null>(null);
  const [popoverCharGloss, setCharGloss] = useState<string | null>(null);

  let glossedChars = 0;

  const { components: termComponents, indexes: termComponentsIndexes } =
    gloss?.getTermComponents() || {
      components: [],
      indexes: new Map<GlossedTermComponent, number>(),
    };

  return (
    <span className="relative">
      {Array.from(text, (char, charIndex) => {
        const isExpectedInGloss = !textIsPunctuation(char);
        const glossIndex = glossedChars;
        glossedChars += isExpectedInGloss ? 1 : 0;

        const id = `text-${char}-${charIndex}`;

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
        const entries = lookUpTermsAt(vocab, lookups, charIndex);

        if (!entries.length) {
          return (
            <span key={charIndex} className={`font-sans `}>
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
            key={charIndex}
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
                setCharIndex(charIndex);
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
      {popover.open && popoverCharIndex != null && (
        <PopoverDictionaryContent
          text={text}
          popover={popover}
          popoverCharIndex={popoverCharIndex}
          vocab={vocab}
          enGloss={popoverCharGloss}
          lookups={lookups}
        />
      )}
    </span>
  );
}

function PopoverDictionaryContent({
  text,
  popover,
  popoverCharIndex,
  vocab,
  enGloss,
  lookups,
}: {
  text: string;
  popover: ReturnType<typeof usePopover>;
  popoverCharIndex: number;
  vocab: LexiconJson;
  enGloss: string | null;
  lookups: TextLookups;
}) {
  const lookupResult = lookUpTermsAt(
    vocab,
    lookups,
    // text,
    popoverCharIndex
  );
  const popoverChar = text[popoverCharIndex];
  if (!lookupResult.length) return null;
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
            {lookupResult.map((entry, i, entries) => {
              const enDefinitionSegmentsCount =
                entry.en?.split(/[,;]/).length || 0;

              return (
                <div key={i} className="p-1 rounded">
                  {entry.head !== popoverChar && <>{entry.head} </>}
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

function lookUpTermsAt(
  { vocab }: LexiconJson,
  lookups: TextLookups,
  index: number
) {
  const matches = lookups[index];
  return matches.flatMap((match) => vocab[match] || []);
}

function getCompoundsAt(
  compoundTermsLookupTree: CompoundTermsLookupTree,
  text: string,
  index: number
): string[] {
  const matches: string[] = [];
  let visitedChars = [];
  let node = compoundTermsLookupTree;
  for (let i = index; i < text.length; i++) {
    const char = text[i];
    visitedChars.push(char);
    if (!node.next[char]) break;
    node = node.next[char];
    if (node.matches.length) {
      const matchedTerm = visitedChars.join("");
      console.log("matchedTerm", matchedTerm);
      matches.push(matchedTerm);
    }
  }

  return matches;
}

/** character index to matched terms */
type TextLookups = {
  [index: number]: string[];
};

type CompoundTermsLookupTree = {
  /** currently only one member, keeping as array to accommodate character variants eventually.
   * the root node will have zero matches */
  matches: string[];
  next: {
    [character: string]: CompoundTermsLookupTree;
  };
};
function getCompoundTermsLookupTree(
  { vocab }: LexiconJson,
  tree: CompoundTermsLookupTree = { matches: [], next: {} }
) {
  for (const term in vocab) {
    if (term.length > 1) {
      addCompoundTermToLookupTree(tree, term);
    }
  }
  return tree;
}
function addCompoundTermToLookupTree(
  tree: CompoundTermsLookupTree,
  term: string
) {
  let node = tree;
  for (let i = 0; i < term.length; i++) {
    const char = term[i];
    node.next[char] ||= { matches: [], next: {} };
    node = node.next[char];
  }
  node.matches.push(term[term.length - 1]);
}

function getLookups(text: string, lexicon: LexiconJson): TextLookups {
  const lookups: TextLookups = {};
  const compoundTermsLookupTree = getCompoundTermsLookupTree(lexicon);
  for (let i = 0; i < text.length; i++) {
    const compounds = getCompoundsAt(compoundTermsLookupTree, text, i);
    const character = text[i];
    const mainVariantsForChar = lexicon.variants[character];
    const matches = [
      ...compounds,
      ...(lexicon.vocab[character] ? [character] : []),
      ...(mainVariantsForChar || []).filter(
        (variant) => lexicon.vocab[variant]
      ),
    ];
    lookups[i] = lookups[i] ? [...matches, ...lookups[i]] : matches;
    for (const compound of compounds) {
      for (let j = 0; j < compound.length; j++) {
        lookups[i + j] = lookups[i + j]
          ? [...lookups[i + j], compound]
          : [compound];
      }
    }
  }
  return lookups;
}
