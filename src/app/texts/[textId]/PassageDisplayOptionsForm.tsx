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
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <section
        className="mb-4  border-1 border border-foreground/25 rounded p-2 cursor-pointer text-center"
        onClick={() => setIsOpen(true)}
      >
        {displayOptions.ruby === "jyutping" && <>Cantonese Jyutping</>}
        {displayOptions.ruby === "pinyin" && <>Hanyu Pinyin</>}
        {displayOptions.ruby === "kr" && <>Sino-Korean</>}
        {displayOptions.ruby === "vi" && <>Sino-Vietnamese</>}
        {displayOptions.ruby === "en" && <>English gloss</>}
        {displayOptions.ruby === "qieyun" && (
          <>
            Middle Chinese /{" "}
            {displayOptions.qieyun === "karlgren" && "Karlgren (1957)"}
            {displayOptions.qieyun === "pulleyblank-emc" &&
              "Pulleyblank (1991) Early Middle Chinese"}
            {displayOptions.qieyun === "pulleyblank-lmc" &&
              "Pulleyblank (1991) Late Middle Chinese"}
            {displayOptions.qieyun === "pan" && "Pan Wuyun (2013)"}
            {displayOptions.qieyun === "decorated-onyomi" &&
              '"Decorated On\'yomi" romanization'}
          </>
        )}
        {displayOptions.ruby === null && <>no gloss</>}
        {" / "}
        {displayOptions.translation === "gloss" && <>gloss translation</>}
        {displayOptions.translation === "idiomatic" && (
          <>idiomatic translation</>
        )}
        {displayOptions.translation === null && <>no translation</>}
      </section>
    );
  }

  return (
    <form className="mb-4  border-1 border border-foreground/25 rounded p-2 ">
      <div className="mb-2 flex-row flex-wrap justify-around gap-2 flex">
        <RadioInputAndLabel
          name="ruby"
          id="ruby-jyutping"
          value="jyutping"
          checked={displayOptions.ruby === "jyutping"}
          onChange={() =>
            setDisplayOptions((opts) => ({ ...opts, ruby: "jyutping" }))
          }
          label="Cantonese Jyutping"
        />
        <RadioInputAndLabel
          name="ruby"
          id="ruby-pinyin"
          value="pinyin"
          checked={displayOptions.ruby === "pinyin"}
          onChange={() =>
            setDisplayOptions((opts) => ({ ...opts, ruby: "pinyin" }))
          }
          label="Hanyu Pinyin"
        />
        <RadioInputAndLabel
          name="ruby"
          id="ruby-kr"
          value="kr"
          checked={displayOptions.ruby === "kr"}
          onChange={() =>
            setDisplayOptions((opts) => ({ ...opts, ruby: "kr" }))
          }
          label="Sino-Korean"
        />
        <RadioInputAndLabel
          name="ruby"
          id="ruby-vi"
          value="vi"
          checked={displayOptions.ruby === "vi"}
          onChange={() =>
            setDisplayOptions((opts) => ({ ...opts, ruby: "vi" }))
          }
          label="Sino-Vietnamese"
        />
        <RadioInputAndLabel
          name="ruby"
          id="ruby-qieyun"
          value="qieyun"
          checked={displayOptions.ruby === "qieyun"}
          onChange={() =>
            setDisplayOptions((opts) => ({ ...opts, ruby: "qieyun" }))
          }
          label="Middle Chinese"
        />
        <RadioInputAndLabel
          name="ruby"
          id="ruby-en"
          value="en"
          checked={displayOptions.ruby === "en"}
          onChange={() =>
            setDisplayOptions((opts) => ({ ...opts, ruby: "en" }))
          }
          label="English gloss"
        />
        <RadioInputAndLabel
          name="ruby"
          id="ruby-null"
          value="null"
          checked={displayOptions.ruby === null}
          onChange={() =>
            setDisplayOptions((opts) => ({ ...opts, ruby: null }))
          }
          label="none"
        />
      </div>

      {displayOptions.ruby === "qieyun" && (
        <div className="mb-2 flex-row flex-wrap justify-around gap-2 flex border-solid border-t border-foreground/25 pt-2">
          <RadioInputAndLabel
            name="qieyun"
            id="qieyun-karlgren"
            value="karlgren"
            checked={displayOptions.qieyun === "karlgren"}
            onChange={() =>
              setDisplayOptions((opts) => ({ ...opts, qieyun: "karlgren" }))
            }
            label="reconstructed Middle Chinese (Karlgren 1957)"
          />
          <RadioInputAndLabel
            name="qieyun"
            id="qieyun-pulleyblank-emc"
            value="pulleyblank-emc"
            checked={displayOptions.qieyun === "pulleyblank-emc"}
            onChange={() =>
              setDisplayOptions((opts) => ({
                ...opts,
                qieyun: "pulleyblank-emc",
              }))
            }
            label="reconstructed Early Middle Chinese (Pulleyblank 1991)"
          />
          <RadioInputAndLabel
            name="qieyun"
            id="qieyun-pulleyblank-lmc"
            value="pulleyblank-lmc"
            checked={displayOptions.qieyun === "pulleyblank-lmc"}
            onChange={() =>
              setDisplayOptions((opts) => ({
                ...opts,
                qieyun: "pulleyblank-lmc",
              }))
            }
            label="reconstructed Late Middle Chinese (Pulleyblank 1991)"
          />
          <RadioInputAndLabel
            name="qieyun"
            id="qieyun-pan"
            value="pan"
            checked={displayOptions.qieyun === "pan"}
            onChange={() =>
              setDisplayOptions((opts) => ({ ...opts, qieyun: "pan" }))
            }
            label="reconstructed Middle Chinese (Pan Wuyun 2013)"
          />
          <RadioInputAndLabel
            name="qieyun"
            id="qieyun-decorated-onyomi"
            value="decorated-onyomi"
            checked={!displayOptions.qieyun || displayOptions.qieyun === "decorated-onyomi"}
            onChange={() =>
              setDisplayOptions((opts) => ({
                ...opts,
                qieyun: "decorated-onyomi",
              }))
            }
            label={'"Decorated On\'yomi" romanization'}
          />
        </div>
      )}
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
      <div className="mb-2 pt-2 flex justify-center border-solid border-t border-foreground/25">
        <button className="" onClick={() => setIsOpen(false)}>
          hide display settings
        </button>
      </div>
    </form>
  );
}

export function useDisplayOptions() {
  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>((): DisplayOptions => {
    const storedString =
      globalThis.window && localStorage.getItem("displayOptions");
    const parsed = storedString ? JSON.parse(storedString) : null;
    if (parsed?.version === LATEST_DISPLAY_OPTIONS_VERSION) {
      return parsed;
    }
    return {
      ruby: "pinyin",
      translation: "gloss",
      version: LATEST_DISPLAY_OPTIONS_VERSION,
      qieyun: "decorated-onyomi"
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

export function RadioInputAndLabel({
  id,
  value,
  name,
  checked,
  onChange,
  label,
}: {
  id: string;
  value: string;
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <span>
      <input
        type="radio"
        id={id}
        name={name}
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
