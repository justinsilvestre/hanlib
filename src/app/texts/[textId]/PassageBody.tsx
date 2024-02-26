"use client";
import { Passage, PassageVocab } from "../Passage";
import { ChineseWithPopover, DisplayOptions } from "./ChineseWithPopover";
import { ReactNode, useState } from "react";
import { normalizeText } from "./punctuation";
import { parseGloss } from "./parseGloss";
import { GlossDocument, TranslationElement } from "@/app/glossUtils";
import { PassageNotes } from "./PassageNotes";

export function PassageBody({
  passage,
  vocab,
  displayOptions,
}: {
  passage: Passage;
  vocab: PassageVocab;
  displayOptions: DisplayOptions;
}) {
  const notesWithHeadings: { id: string; heading: string }[] = [];
  const [highlightedCharactersRange, setHighlightedCharactersRange] = useState<{
    lineIndex: number;
    startCharacterIndex: number;
    endCharacterIndex: number;
  } | null>(null);
  const getSetHoveredCharacterLocation =
    (lineIndex: number) =>
    (
      characterRange: {
        startCharacterIndex: number;
        endCharacterIndex: number;
      } | null
    ) => {
      setHighlightedCharactersRange(
        characterRange === null ? null : { lineIndex, ...characterRange }
      );
    };

  return (
    <>
      <section className="mb-4">
        {passage.lines.map((line, lineIndex) => {
          const glossText = line.gloss?.replaceAll(/^`|`$/g, "") || null;

          const gloss = parseGloss(glossText);
          let charactersProcessed = 0;
          const chineseSegments = line.chinese
            .split(/(?={)|(?<=})/)
            .reduce((segments, segment) => {
              const [noteId, text = ""] = segment.startsWith("{")
                ? segment.slice(1, -1).split(":")
                : [null, segment];
              if (noteId) notesWithHeadings.push({ id: noteId, heading: text });

              const normalizedText = normalizeText(text);

              segments.push({
                noteId,
                text,
                normalizedText,
                gloss: gloss.result || null,
                segmentStartingCharacterIndexInLine: charactersProcessed,
              });
              charactersProcessed += normalizedText.length;

              return segments;
            }, [] as { noteId: string | null; text: string; normalizedText: string; gloss: GlossDocument | null; segmentStartingCharacterIndexInLine: number }[]);

          return (
            <section key={lineIndex} className="mb-4">
              {chineseSegments.map(
                (
                  { noteId, text, gloss, segmentStartingCharacterIndexInLine },
                  segmentIndex
                ) => {
                  return (
                    <div
                      key={segmentIndex}
                      className="text-4xl inline leading-relaxed"
                    >
                      <span
                        className={
                          noteId
                            ? `border-b-blue-500 border-dotted border-b-2`
                            : ""
                        }
                      >
                        <ChineseWithPopover
                          text={text}
                          vocab={vocab}
                          displayOptions={displayOptions}
                          gloss={gloss}
                          highlightedCharactersRange={
                            highlightedCharactersRange?.lineIndex === lineIndex
                              ? highlightedCharactersRange
                              : null
                          }
                          segmentStartingCharacterIndexInLine={
                            segmentStartingCharacterIndexInLine
                          }
                          setHighlightedCharactersRange={getSetHoveredCharacterLocation(
                            lineIndex
                          )}
                        />
                      </span>
                      {noteId && (
                        <a
                          className="text-blue-500/50 align-super text-sm"
                          href={`#note-${noteId}`}
                          id={`noteref-${noteId}`}
                        >
                          [{noteId}]
                        </a>
                      )}
                    </div>
                  );
                }
              )}
              {(!gloss.result ||
                displayOptions.translation === "idiomatic") && (
                <div className="">{toCurlyQuotes(line.english)}</div>
              )}
              {displayOptions.translation === "gloss" && gloss.result && (
                <div className="text-lg">
                  {gloss.result
                    .getTranslation()
                    ?.renderTranslation<ReactNode, ReactNode[]>({
                      combineElements: (base, addition) =>
                        base.concat(addition),
                      mapTranslationElementFn: (
                        element,
                        leadingSpace,
                        capitalizedTranslation,
                        translationElementIndex
                      ) => {
                        const highlightTargetRange =
                          (element.type === "CharacterGloss" && {
                            startCharacterIndex: element.characterIndex,
                            endCharacterIndex: element.characterIndex,
                          }) ||
                          (element.type === "CompoundGloss" && {
                            startCharacterIndex: element.characterIndexes[0],
                            endCharacterIndex: element.characterIndexes.at(-1)!,
                          });

                        const highlighted =
                          highlightedCharactersRange &&
                          lineIndex === highlightedCharactersRange.lineIndex &&
                          highlightTargetRange &&
                          highlightTargetRange.startCharacterIndex >=
                            highlightedCharactersRange.startCharacterIndex &&
                          highlightTargetRange.endCharacterIndex <=
                            highlightedCharactersRange.endCharacterIndex;
                        return (
                          <GlossElement
                            key={String(translationElementIndex)}
                            translationElementIndex={translationElementIndex}
                            element={element}
                            leadingSpace={leadingSpace}
                            capitalizedTranslation={capitalizedTranslation}
                            highlighted={!!highlighted}
                            highlightTargetRange={highlightTargetRange || null}
                            setHoveredCharacterLocation={getSetHoveredCharacterLocation(
                              lineIndex
                            )}
                          />
                        );
                      },
                      base: [] as ReactNode[],
                    }) || ""}
                </div>
              )}
            </section>
          );
        })}
      </section>
      <PassageNotes
        notesWithHeadings={notesWithHeadings}
        vocab={vocab}
        displayOptions={displayOptions}
        passage={passage}
      />
    </>
  );
}

export function GlossElement({
  translationElementIndex,
  element,
  leadingSpace,
  capitalizedTranslation,
  highlighted,
  setHoveredCharacterLocation,
  highlightTargetRange,
}: {
  translationElementIndex: number;
  element: TranslationElement;
  leadingSpace: string;
  capitalizedTranslation: {
    type: "Padding" | "EndPunctuation" | "GlossComponent";
    text: string;
  }[];
  highlighted: boolean;
  setHoveredCharacterLocation: (
    characterRange: {
      startCharacterIndex: number;
      endCharacterIndex: number;
    } | null
  ) => void;
  highlightTargetRange: {
    startCharacterIndex: number;
    endCharacterIndex: number;
  } | null;
}) {
  return (
    <span key={String(translationElementIndex)}>
      {leadingSpace}
      {capitalizedTranslation.map((segment, segmentIndex) => {
        if (segment.type === "Padding" || segment.type === "EndPunctuation") {
          return (
            <span key={segmentIndex} className="italic font-extralight">
              {segment.text}
            </span>
          );
        }
        return (
          <span
            key={segmentIndex}
            className={`${
              highlighted && segment.type === "GlossComponent"
                ? "bg-yellow-500/50"
                : ""
            }`}
            onMouseEnter={
              segment.type === "GlossComponent" && highlightTargetRange
                ? () => {
                    setHoveredCharacterLocation({
                      startCharacterIndex:
                        highlightTargetRange.startCharacterIndex,
                      endCharacterIndex:
                        highlightTargetRange?.endCharacterIndex,
                    });
                  }
                : undefined
            }
            onMouseLeave={() => {
              setHoveredCharacterLocation(null);
            }}
          >
            {segment.text}
          </span>
        );
      })}
    </span>
  );
}
export function toCurlyQuotes(text: string) {
  return text.replace(/(?<=^|\s)"/g, "“").replace(/"/g, "”");
}
