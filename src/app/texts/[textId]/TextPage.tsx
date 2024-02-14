"use client";

import Markdown from "markdown-to-jsx";
import markdownCss from "./markdown.module.css";
import { Passage, PassageVocab } from "../Passage";
import { ChineseWithPopover, DisplayOptions } from "./ChineseWithPopover";
import { useEffect, useRef, useState } from "react";
import { normalizeText } from "./punctuation";

export default function TextPage({
  text,
  vocab,
}: {
  text: Passage;
  vocab: PassageVocab;
}) {
  const notesWithHeadings: { id: string; heading: string }[] = [];
  const [displayOptions, setDisplayOptions] = useDisplayOptions();
  return (
    <main className="flex min-h-screen flex-col max-w-lg m-auto p-4">
      <div className="mb-4">
        <h2 className="font-bold text-center">{text.frontmatter.title}</h2>

        <Markdown
          className={`text-sm ${markdownCss.markdown}`}
          options={{
            overrides: {
              center: {
                component: (props) => (
                  <div className="text-center text-sm">{props.children}</div>
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

      <form className="mb-4 text-sm border-1 border border-foreground/25 rounded p-2 ">
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
        <div>
          <input
            type="checkbox"
            id="translation"
            checked={displayOptions.translation}
            onChange={() =>
              setDisplayOptions((opts) => ({
                ...opts,
                translation: !opts.translation,
              }))
            }
          />
          <label htmlFor="translation" className="ml-1">
            English translation
          </label>
        </div>
      </form>

      <section className="mb-4">
        {text.lines.map((line, i) => {
          const lineGloss = line.gloss
            ?.replaceAll(/\([^)]+\)/g, "")
            .split(/ +|-/);
          const chineseSegments = line.chinese
            .split(/(?={)|(?<=})/)
            .reduce((segments, segment) => {
              const [noteId, text] = segment.startsWith("{")
                ? segment.slice(1, -1).split(":")
                : [null, segment];
              if (noteId) notesWithHeadings.push({ id: noteId, heading: text });

              const normalizedText = normalizeText(text);
              const glossedSoFar = segments.reduce(
                (acc, { normalizedText }) => acc + normalizedText.length,
                0
              );
              const gloss =
                lineGloss?.slice(
                  glossedSoFar,
                  glossedSoFar + normalizedText.length
                ) || null;

              segments.push({
                noteId,
                text,
                normalizedText,
                gloss,
              });
              return segments;
            }, [] as { noteId: string | null; text: string; normalizedText: string; gloss: string[] | null }[]);

          return (
            <section key={i} className="mb-4">
              {chineseSegments.map(({ noteId, text, gloss }, segmentIndex) => {
                return (
                  <div key={segmentIndex} className="text-3xl inline">
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
                      />
                    </span>
                    {noteId && (
                      <a
                        className="text-blue-500 align-super text-xs"
                        href={`#note-${noteId}`}
                        id={`noteref-${noteId}`}
                      >
                        [{noteId}]
                      </a>
                    )}
                  </div>
                );
              })}
              {displayOptions.translation && (
                <div className="text-sm mt-2">
                  {toCurlyQuotes(line.english)}
                </div>
              )}
            </section>
          );
        })}
      </section>

      {notesWithHeadings.length > 0 && (
        <section>
          <h3 className="font-bold mb-4 text-xl text-center">Notes</h3>
          {notesWithHeadings.map(({ id: noteId, heading }, i) => {
            return (
              <div
                key={i}
                className="mb-4 border-1 border p-2 rounded border-foreground border-opacity-50"
                id={`note-${noteId}`}
              >
                <h3 className="text-xl mb-4">
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

function useDisplayOptions() {
  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>(() =>
    globalThis.window && localStorage.getItem("displayOptions")
      ? JSON.parse(localStorage.getItem("displayOptions") as string)
      : {
          ruby: "vi",
          translation: true,
        }
  );
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
  gloss: string[] | null;
}) {
  return (
    <span className="text-2xl">
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
