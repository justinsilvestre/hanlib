"use client";

import Markdown from "markdown-to-jsx";
import markdownCss from "./markdown.module.css";
import { Passage, PassageVocab } from "../Passage";
import {
  ChineseWithPopover,
  DisplayOptions,
  LATEST_DISPLAY_OPTIONS_VERSION,
} from "./ChineseWithPopover";
import { ReactNode, useEffect, useRef, useState } from "react";
import { normalizeText } from "./punctuation";
import { parseGloss } from "./parseGloss";
import { GlossDocument, TranslationElement } from "@/app/glossUtils";

export default function TextPage({
  text,
  vocab,
}: {
  text: Passage;
  vocab: PassageVocab;
}) {
  const notesWithHeadings: { id: string; heading: string }[] = [];
  const [displayOptions, setDisplayOptions] = useDisplayOptions();
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
      console.log(characterRange);
      setHighlightedCharactersRange(
        characterRange === null ? null : { lineIndex, ...characterRange }
      );
    };

  return (
    <main className="flex min-h-screen flex-col max-w-xl m-auto p-4">
      <div className="mb-4">
        <h2 className="font-bold text-center">{text.frontmatter.title}</h2>

        <Markdown
          className={` ${markdownCss.markdown}`}
          options={{
            overrides: {
              center: {
                component: (props) => (
                  <div className="text-center ">{props.children}</div>
                ),
              },
              code: {
                component: NotesChinese,
                props: {
                  vocab,
                  displayOptions,
                  gloss: null,
                },
              },
            },
          }}
        >
          {toCurlyQuotes(text.frontmatter.description)}
        </Markdown>
      </div>

      <form className="mb-4  border-1 border border-foreground/25 rounded p-2 ">
        <div className="mb-2 flex-row flex-wrap justify-around gap-2 flex">
          <RubyRadioInputAndLabel
            id="ruby-jyutping"
            value="jyutping"
            checked={displayOptions.ruby === "jyutping"}
            onChange={() =>
              setDisplayOptions((opts) => ({ ...opts, ruby: "jyutping" }))
            }
            label="Cantonese Jyutping"
          />
          <RubyRadioInputAndLabel
            id="ruby-pinyin"
            value="pinyin"
            checked={displayOptions.ruby === "pinyin"}
            onChange={() =>
              setDisplayOptions((opts) => ({ ...opts, ruby: "pinyin" }))
            }
            label="Hanyu Pinyin"
          />
          <RubyRadioInputAndLabel
            id="ruby-kr"
            value="kr"
            checked={displayOptions.ruby === "kr"}
            onChange={() =>
              setDisplayOptions((opts) => ({ ...opts, ruby: "kr" }))
            }
            label="Sino-Korean"
          />
          <RubyRadioInputAndLabel
            id="ruby-vi"
            value="vi"
            checked={displayOptions.ruby === "vi"}
            onChange={() =>
              setDisplayOptions((opts) => ({ ...opts, ruby: "vi" }))
            }
            label="Sino-Vietnamese"
          />

          <RubyRadioInputAndLabel
            id="ruby-null"
            value="null"
            checked={displayOptions.ruby === null}
            onChange={() =>
              setDisplayOptions((opts) => ({ ...opts, ruby: null }))
            }
            label="none"
          />
        </div>
        <div className="mb-2 flex-row flex-wrap justify-around gap-2 flex border-solid border-t border-foreground/25 pt-2">
          <span>
            <input
              type="radio"
              id="translation-gloss"
              name="translation"
              value="gloss"
              checked={displayOptions.translation === "gloss"}
              onChange={() =>
                setDisplayOptions((opts) => ({ ...opts, translation: "gloss" }))
              }
            />
            <label htmlFor="translation-gloss" className="ml-1">
              Gloss-translation
            </label>
          </span>
          <span>
            <input
              type="radio"
              id="translation-idiomatic"
              name="translation"
              value="idiomatic"
              checked={displayOptions.translation === "idiomatic"}
              onChange={() =>
                setDisplayOptions((opts) => ({
                  ...opts,
                  translation: "idiomatic",
                }))
              }
            />
            <label htmlFor="translation-idiomatic" className="ml-1">
              Idiomatic translation
            </label>
          </span>
        </div>
      </form>

      <section className="mb-4">
        {text.lines.map((line, lineIndex) => {
          const glossText = line.gloss?.replaceAll(/^`|`$/g, "") || null;

          const gloss = parseGloss(glossText);
          let charactersProcessed = 0;
          const chineseSegments = line.chinese
            .split(/(?={)|(?<=})/)
            .reduce((segments, segment) => {
              const [noteId, text] = segment.startsWith("{")
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
                          className="text-blue-500 align-super text-sm"
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
                <div className=" mt-2">{toCurlyQuotes(line.english)}</div>
              )}
              {displayOptions.translation === "gloss" && gloss.result && (
                <div className="mt-2 text-lg">
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

      {notesWithHeadings.length > 0 && (
        <section>
          <h3 className="font-bold mb-4 text-2xl text-center">Notes</h3>
          {notesWithHeadings.map(({ id: noteId, heading }, i) => {
            return (
              <div
                key={i}
                className="mb-4 border-1 border p-2 rounded border-foreground border-opacity-50"
                id={`note-${noteId}`}
              >
                <h3 className="text-2xl mb-4">
                  <a className="text-blue-500" href={`#noteref-${noteId}`}>
                    [{noteId}]
                  </a>{" "}
                  {heading}
                </h3>
                <Markdown
                  className={markdownCss.markdown}
                  options={{
                    overrides: {
                      code: {
                        component: NotesChinese,
                        props: {
                          vocab,
                          displayOptions,
                          gloss: null,
                        },
                      },
                    },
                  }}
                >
                  {text.notes[noteId] || ""}
                </Markdown>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}

function GlossElement({
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
            <span key={segmentIndex} className=" font-extralight">
              {segment.text}
            </span>
          );
        }
        return (
          <span
            key={segmentIndex}
            className={`${
              highlighted && segment.type === "GlossComponent"
                ? "bg-yellow-200"
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

function useDisplayOptions() {
  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>(() => {
    const storedString =
      globalThis.window && localStorage.getItem("displayOptions");
    const parsed = storedString ? JSON.parse(storedString) : null;
    if (parsed?.version === LATEST_DISPLAY_OPTIONS_VERSION) {
      return parsed;
    }
    return {
      ruby: "vi",
      translation: "gloss",
      version: LATEST_DISPLAY_OPTIONS_VERSION,
    };
  });
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      const localStorageDisplayOptions = localStorage.getItem("displayOptions");
      if (localStorageDisplayOptions) {
        setDisplayOptions(JSON.parse(localStorageDisplayOptions));
      }
      initialized.current = true;
    } else {
      localStorage.setItem("displayOptions", JSON.stringify(displayOptions));
    }
  }, [displayOptions]);

  return [displayOptions, setDisplayOptions] as const;
}

function NotesChinese({
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

function RubyRadioInputAndLabel({
  id,
  value,
  checked,
  onChange,
  label,
}: {
  id: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <span>
      <input
        type="radio"
        id={id}
        name="ruby"
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <label htmlFor={id} className="ml-1">
        {label}
      </label>
    </span>
  );
}

function toCurlyQuotes(text: string) {
  return text.replace(/(?<=^|\s)"/g, "“").replace(/"/g, "”");
}
