"use client";
import { useEffect, useRef, useState } from "react";
import TextPage from "../texts/[textId]/TextPage";
import { Passage, PassageVocab, parsePassage } from "../texts/Passage";

export function ContributePage({ lexicon }: { lexicon: PassageVocab }) {
  const [passage, setPassage] = useState<Passage>({
    frontmatter: {
      title: "",
      description: "",
    },
    lines: [],
    notes: {},
  });

  const [text, setText] = useState("");
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
      const text = localStorage.getItem("text");
      if (text) {
        updateTextAndParse(text);
      }
      initialized.current = true;
    } else {
      localStorage.setItem("text", text);
    }
  }, [text]);

  const [errors, setErrors] = useState<string[]>([]);
  const handleTextChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    updateTextAndParse(e.target.value);
  };

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
          className="w-full h-full text-black"
          value={text}
          onChange={handleTextChange}
          placeholder="Enter text here"
        ></textarea>
      </form>
      <div className="basis-1/2 overflow-auto max-h-screen">
        <TextPage text={passage} vocab={lexicon} />
      </div>
    </div>
  );
}