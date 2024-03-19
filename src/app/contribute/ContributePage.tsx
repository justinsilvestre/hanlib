"use client";
import { useEffect, useRef, useState } from "react";
import TextPage from "../texts/[textId]/TextPage";
import { Passage, PassageVocab, parsePassage } from "../texts/Passage";
import {
  PassageDisplayOptionsForm,
  useDisplayOptions,
} from "../texts/[textId]/PassageDisplayOptionsForm";
import { PassageBody } from "../texts/[textId]/PassageBody";
import { PassageFrontmatter } from "../texts/[textId]/PassageFrontmatter";
import Link from "next/link";

export function ContributePage({
  passageId,
  initialText = "",
  lexicon,
}: {
  passageId?: string;
  initialText?: string;
  lexicon: PassageVocab;
}) {
  const storageKey = `contribute-${passageId || "NEW"}`;
  const [passage, setPassage] = useState<Passage>(() => {
    try {
      return parsePassage(initialText);
    } catch (err) {
      return {
        frontmatter: {
          title: "",
          description: "",
        },
        lines: [],
        notes: {},
      };
    }
  });

  const [text, setText] = useState(initialText);
  function updateTextAndParse(newText: string) {
    setText(newText);
    try {
      const passage = parsePassage(newText);
      setPassage(passage);
      setErrors([]);
      console.log(newText);
    } catch (e) {
      console.error(e);

      if (e instanceof Error) {
        setErrors([e.message]);
      } else {
        setErrors([String(e)]);
      }
    }
  }
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      const text = localStorage.getItem(storageKey);
      if (text) {
        updateTextAndParse(text);
      }
      initialized.current = true;
    } else {
      localStorage.setItem(storageKey, text);
    }
  }, [text]);

  const [errors, setErrors] = useState<string[]>([]);
  const handleTextChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    updateTextAndParse(e.target.value);
  };
  const [displayOptions, setDisplayOptions] = useDisplayOptions();

  return (
    <div className="flex flex-row p-4 gap-4 max-h-[calc(100vh-5rem)]">
      <form className="basis-1/2" onSubmit={(e) => e.preventDefault()}>
        <div className="border-b-2 border-gray-300 mb-4">
          {errors.map((error, i) => (
            <div key={i} className="text-red-500">
              {error}
            </div>
          ))}
        </div>
        <textarea
          name="text"
          id="text"
          className={`w-full h-full ${
            initialText === text ? "text-gray-500" : "text-black"
          }`}
          value={text}
          onChange={handleTextChange}
          placeholder="Enter text here"
        ></textarea>
        {passageId && (
          <div className="flex flex-row justify-between">
            <Link
              className="p-1 bg-indigo-100 border-indigo-300 rounded border-1 border text-black"
              href={`/texts/${passageId}`}
            >
              hide source
            </Link>
            <button
              className="p-1 bg-indigo-100 border-indigo-300 rounded border-1 border text-black"
              onClick={() => {
                if (confirm("Are you sure you want to reset?")) {
                  setText(initialText);
                }
              }}
            >
              reset
            </button>
            <button
              className="p-1 bg-indigo-100 border-indigo-300 rounded border-1 border text-black"
              onClick={() => {
                // copy text to clipboard
                navigator.clipboard.writeText(text).then(
                  () => {
                    console.log("Text copied to clipboard");
                    alert("Text copied to clipboard");
                  },
                  (err) => {
                    console.error("Error copying text to clipboard", err);
                    alert("Error copying text to clipboard");
                  }
                );
              }}
            >
              copy edits to clipboard
            </button>
          </div>
        )}
      </form>
      <div className="basis-1/2 overflow-auto max-h-screen">
        <main className="flex min-h-screen flex-col max-w-xl m-auto p-4">
          <PassageFrontmatter
            text={passage}
            vocab={lexicon}
            displayOptions={displayOptions}
          />
          <PassageDisplayOptionsForm
            displayOptions={displayOptions}
            setDisplayOptions={setDisplayOptions}
          />
          <PassageBody
            passageId={passageId || "NEW"}
            passage={passage}
            vocab={lexicon}
            displayOptions={displayOptions}
          />
        </main>
      </div>
    </div>
  );
}
