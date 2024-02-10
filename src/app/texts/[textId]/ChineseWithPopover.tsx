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

  let glossedChars = 0;

  return (
    <span className="relative">
      {Array.from(text, (char, i) => {
        const isExpectedInGloss = !textIsPunctuation(char);
        const glossIndex = glossedChars;
        glossedChars += isExpectedInGloss ? 1 : 0;

        const id = `text-${char}-${i}`;

        if (!vocab[char]) {
          return <span key={i}>{char}</span>;
        }
        let rubyText: string | null = null;
        if (displayOptions.ruby === "en")
          rubyText = gloss?.[glossIndex]?.replace(/_/g, " ") || null;
        else
          rubyText =
            displayOptions?.ruby && vocab[char]
              ? vocab[char]![0][displayOptions.ruby]
              : null;

        return (
          <span
            key={i}
            {...popover.getReferenceProps({
              className: `relative cursor:pointer hover:bg-background ${
                popover.refs.domReference.current?.id === id
                  ? "bg-blue-500/20"
                  : ""
              }`,
              onClick: (e) => {
                popover.refs.setReference(e.currentTarget);
                setChar(char);
              },
            })}
          >
            {rubyText ? (
              <ruby id={id}>
                {char}
                <rt className="text-[0.40em] mr-[0.40em]">{rubyText}</rt>
              </ruby>
            ) : (
              char
            )}
          </span>
        );
      })}
      {popover.open && popoverChar && vocab[popoverChar] && (
        <FloatingPortal>
          <FloatingFocusManager context={popover.context} modal={popover.modal}>
            <div
              ref={popover.refs.setFloating}
              style={{
                ...popover.floatingStyles,
                filter:
                  "drop-shadow(1px 1px 2px rgb(var(--foreground-rgb) / 0.4))",
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
                  vocab[popoverChar]?.map((entry, i) => (
                    <div key={i} className="p-1 rounded">
                      <b>{entry.vi}</b>{" "}
                      <span className="text-sm">{entry.en}</span>
                    </div>
                  ))}
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </span>
  );
}
