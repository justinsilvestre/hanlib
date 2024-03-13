"use client";
import { Passage, PassageVocab } from "../Passage";
import { ChineseWithPopover, DisplayOptions } from "./ChineseWithPopover";
import { useState } from "react";
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
          const glossComponents = gloss.result?.getTermComponents();
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
              {(displayOptions.translation && !gloss.result) ||
              displayOptions.translation === "idiomatic" ? (
                <div className="">{toCurlyQuotes(line.english)}</div>
              ) : null}
              {displayOptions.translation === "gloss" && gloss.result && (
                <div className="text-lg">
                  {gloss.result
                    .renderTranslation()
                    .translationElements.map(
                      (element, translationElementIndex) => {
                        const highlightTargetRange = element.glossElement
                          .elementType === "GlossedTerm" && {
                          startCharacterIndex: glossComponents!.indexes.get(
                            element.glossElement.components[0]
                          )!,
                          endCharacterIndex: glossComponents!.indexes.get(
                            element.glossElement.components[
                              element.glossElement.components.length - 1
                            ]
                          )!,
                        };

                        const highlighted =
                          highlightedCharactersRange &&
                          lineIndex === highlightedCharactersRange.lineIndex &&
                          highlightTargetRange &&
                          highlightTargetRange.startCharacterIndex >=
                            highlightedCharactersRange.startCharacterIndex &&
                          highlightTargetRange.endCharacterIndex <=
                            highlightedCharactersRange.endCharacterIndex;
                        return (
                          <GlossElementDisplay
                            key={String(translationElementIndex)}
                            translationElement={element}
                            translationElementIndex={translationElementIndex}
                            highlighted={!!highlighted}
                            highlightTargetRange={highlightTargetRange || null}
                            setHoveredCharacterLocation={getSetHoveredCharacterLocation(
                              lineIndex
                            )}
                          />
                        );
                      }
                    )}
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

export function GlossElementDisplay({
  translationElement,
  translationElementIndex,
  highlighted,
  setHoveredCharacterLocation,
  highlightTargetRange,
}: {
  translationElement: TranslationElement;
  translationElementIndex: number;
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
  const [, leadingSpace, textWithoutLeadingSpace] =
    translationElement.renderedText.match(/^(\s*)(.*)/)!;
  return (
    <span key={String(translationElementIndex)}>
      {translationElement.glossElement.elementType === "Padding" && (
        <span className="italic font-extralight">
          {translationElement.renderedText}
        </span>
      )}
      {translationElement.glossElement.elementType === "GlossedTerm" && (
        <>
          {leadingSpace}
          <span
            className={`${highlighted ? "bg-yellow-500/50" : ""}`}
            onMouseEnter={
              highlightTargetRange
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
            {textWithoutLeadingSpace}
          </span>
        </>
      )}
    </span>
  );
}
export function toCurlyQuotes(text: string) {
  return text.replace(/(?<=^|\s)"/g, "“").replace(/"/g, "”");
}
