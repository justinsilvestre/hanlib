"use client";
import Markdown from "markdown-to-jsx";
import markdownCss from "./markdown.module.css";
import { Passage, PassageVocab } from "../Passage";
import { DisplayOptions } from "./ChineseWithPopover";
import { NotesChinese } from "./NotesChinese";
import { toCurlyQuotes } from "./PassageBody";

export function PassageFrontmatter({
  text,
  vocab,
  displayOptions,
}: {
  text: Passage;
  vocab: PassageVocab;
  displayOptions: DisplayOptions;
}) {
  return (
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
        {toCurlyQuotes(text.frontmatter.description || "")}
      </Markdown>
    </div>
  );
}
