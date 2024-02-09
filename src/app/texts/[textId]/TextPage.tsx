"use client";

import Markdown from "markdown-to-jsx";
import markdownCss from "./markdown.module.css";
import { Text, TextVocab } from "../Text";
import { ChineseWithPopover, DisplayOptions } from "./ChineseWithPopover";
import { useState } from "react";
import { normalizeText } from "./punctuation";

export default function TextPage({
  text,
  vocab,
}: {
  text: Text;
  vocab: TextVocab;
}) {
  const notesWithHeadings: { id: string; heading: string }[] = [];
  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>({
    ruby: "vi",
    translation: true,
  });
  return (
    <main className="flex min-h-screen flex-col max-w-lg m-auto p-4">
      <div className="mb-4 text-center">
        <h2 className="font-bold">{text.frontmatter.title}</h2>
        <Markdown className="text-sm">{text.frontmatter.description}</Markdown>
      </div>

      <form className="mb-4 text-sm border-1 border border-foreground/25 rounded p-2 ">
        <div className="mb-2">
          <input
            type="radio"
            id="ruby-vi"
            name="ruby"
            value="vi"
            checked={displayOptions.ruby === "vi"}
            onChange={() =>
              setDisplayOptions((opts) => ({ ...opts, ruby: "vi" }))
            }
          />
          <label htmlFor="ruby-vi" className="ml-1">
            Vietnamese
          </label>
          <input
            type="radio"
            id="ruby-en"
            name="ruby"
            value="en"
            className="ml-4"
            checked={displayOptions.ruby === "en"}
            onChange={() =>
              setDisplayOptions((opts) => ({ ...opts, ruby: "en" }))
            }
          />
          <label htmlFor="ruby-en" className="ml-1">
            English gloss
          </label>
          <input
            type="radio"
            id="ruby-null"
            name="ruby"
            value="null"
            className="ml-4"
            checked={displayOptions.ruby === null}
            onChange={() =>
              setDisplayOptions((opts) => ({ ...opts, ruby: null }))
            }
          />
          <label htmlFor="ruby-null" className="ml-1">
            none
          </label>
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
                <div className="text-sm mt-2">{line.english}</div>
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

function NotesChinese({
  children,
  vocab,
  displayOptions,
  gloss,
}: {
  children: string;
  vocab: TextVocab;
  displayOptions: DisplayOptions;
  gloss: string[] | null;
}) {
  return (
    <span className="text-2xl block">
      <ChineseWithPopover
        text={children}
        vocab={vocab}
        displayOptions={displayOptions}
        gloss={gloss}
      />
    </span>
  );
}
