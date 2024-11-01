"use client";
import Markdown from "markdown-to-jsx";
import markdownCss from "./markdown.module.css";
import { Passage } from "../Passage";
import { DisplayOptions } from "./ChineseWithPopover";
import { ReactNode } from "react";
import { NotesChinese } from "./NotesChinese";
import { LexiconJson } from "@/app/texts/lexicon";

export function PassageNotes({
  notesWithHeadings,
  vocab,
  displayOptions,
  passage,
}: {
  notesWithHeadings: { id: string; heading: string }[];
  vocab: LexiconJson;
  displayOptions: DisplayOptions;
  passage: Passage;
}): ReactNode {
  return (
    notesWithHeadings.length > 0 && (
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
                {passage.notes[noteId] || ""}
              </Markdown>
            </div>
          );
        })}
      </section>
    )
  );
}
