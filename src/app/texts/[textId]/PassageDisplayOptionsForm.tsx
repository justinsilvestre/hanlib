"use client";
import { useState, useRef, useEffect } from "react";
import {
  DisplayOptions,
  LATEST_DISPLAY_OPTIONS_VERSION,
} from "./ChineseWithPopover";

export function PassageDisplayOptionsForm({
  displayOptions,
  setDisplayOptions,
}: {
  displayOptions: DisplayOptions;
  setDisplayOptions: React.Dispatch<React.SetStateAction<DisplayOptions>>;
}) {
  return (
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
          id="ruby-en"
          value="en"
          checked={displayOptions.ruby === "en"}
          onChange={() =>
            setDisplayOptions((opts) => ({ ...opts, ruby: "en" }))
          }
          label="English gloss"
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
            gloss-translation
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
            idiomatic translation
          </label>
        </span>
        <span>
          <input
            type="radio"
            id="translation-null"
            name="translation"
            value="null"
            checked={displayOptions.translation === null}
            onChange={() =>
              setDisplayOptions((opts) => ({
                ...opts,
                translation: null,
              }))
            }
          />
          <label htmlFor="translation-null" className="ml-1">
            none
          </label>
        </span>
      </div>
    </form>
  );
}

export function useDisplayOptions() {
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

export function RubyRadioInputAndLabel({
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
