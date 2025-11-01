const GLOSSED_TERM = "GlossedTerm" as const;
const LEMMA_SEGMENT = "LemmaSegment" as const;
const INFLECTION_SEGMENT = "InflectionSegment" as const;
const PADDING = "Padding" as const;
const GLOSS_ELEMENT = "GlossElement" as const;

type Location = {
  start: {
    line: number;
    column: number;
    offset: number;
  };
  end: {
    line: number;
    column: number;
    offset: number;
  };
};

export class GlossDocument {
  public delimitersAfterReordering: Map<GlossElement, string> = new Map();

  constructor(public elements: GlossElement[]) {}

  getTermComponents() {
    const components = this.elements.flatMap((e) => {
      return e.term.components.map((c) => ({
        parent: e.term,
        term: c,
      }));
    });

    return {
      components,
      indexes: new Map(components.map((c, i) => [c.term, i] as const)),
    };
  }

  orderByTranslation() {
    const translationElements: GlossElement[] = [];
    let pendingNumberedGlosses: ReorderedGlossElement[] = [];

    for (const element of this.elements) {
      if (isReorderedGlossElement(element)) {
        pendingNumberedGlosses.push(element);

        if (element.number === 1) {
          console.log(`REORDERING ${pendingNumberedGlosses.length} ELEMENTS`);
          pendingNumberedGlosses.sort((a, b) => {
            return a.number - b.number;
          });

          this.delimitersAfterReordering.set(pendingNumberedGlosses[0], "");
          this.delimitersAfterReordering.set(
            pendingNumberedGlosses[pendingNumberedGlosses.length - 1],
            pendingNumberedGlosses[0].delimiterBeforeReordering
          );

          console.log(
            `FIRST DELIMITER: ${pendingNumberedGlosses[0].delimiterBeforeReordering}`
          );
          console.log(
            `LAST DELIMITER: ${
              pendingNumberedGlosses[pendingNumberedGlosses.length - 1]
                .delimiterBeforeReordering
            }`
          );

          translationElements.push(...pendingNumberedGlosses);

          pendingNumberedGlosses = [];
        }
      } else {
        translationElements.push(element);
      }
    }

    if (pendingNumberedGlosses.length) {
      pendingNumberedGlosses.sort((a, b) => {
        return a.number - b.number;
      });
      translationElements.push(...pendingNumberedGlosses);
    }

    return translationElements;
  }

  renderTranslation() {
    const translationElements: (Padding | GlossedTerm)[] = [];
    for (const e of this.orderByTranslation()) {
      if (e.prePadding) translationElements.push(e.prePadding);

      translationElements.push(e.term);

      if (e.postPadding?.text) translationElements.push(e.postPadding);

      const delimiter =
        this.delimitersAfterReordering.get(e) ?? e.delimiterBeforeReordering;

      if (delimiter) {
        const delimiterPadding = new Padding(null, delimiter);

        translationElements.push(delimiterPadding);
      }
    }

    const elementsWithText: TranslationElement[] = translationElements.map(
      (element, i) => {
        const prevElement = i > 0 ? translationElements[i - 1] : null;
        return {
          glossElement: element,
          renderedText: renderText(element, prevElement),
        };
      }
    );

    return {
      translationElements: elementsWithText,
      text: elementsWithText.map((e) => e.renderedText).join(""),
    };
  }
}

type ReorderedGlossElement = GlossElement & { number: number };
function isReorderedGlossElement(
  element: GlossElement
): element is ReorderedGlossElement {
  return element.elementType === GLOSS_ELEMENT && element.number !== null;
}

export class GlossElement {
  elementType = GLOSS_ELEMENT;

  constructor(
    public location: Location,
    public number: number | null,
    public originalTerm: string,
    public prePadding: Padding | null,
    public term: GlossedTerm,
    public postPadding: Padding | null,
    public delimiterBeforeReordering: string
  ) {}
}

export class GlossedTerm {
  elementType = GLOSSED_TERM;
  number?: number;

  constructor(
    public location: Location,
    public components: GlossedTermComponent[],
    public idiomatic: IdiomaticGlossedTerm | null = null,
    public inflected: string | null = null
  ) {}

  getLemma() {
    if (this.components.length > 1) return this.getIdiomaticLemma()!;
    return renderWithoutSpecialCharacters(
      this.components
        .flatMap((c) => c.segments)
        .filter((s) => s.segmentType === LEMMA_SEGMENT)
        .map((s) => s.text)
        .join(""),
      false
    );
  }

  getIdiomaticLemma() {
    return this.idiomatic
      ? renderWithoutSpecialCharacters(
          this.idiomatic.segments
            .filter((s) => s.segmentType === LEMMA_SEGMENT)
            .map((s) => s.text)
            .join(""),
          false
        )
      : null;
  }

  getText() {
    const inflected = this.idiomatic?.inflected || this.inflected;
    if (inflected) {
      return renderWithoutSpecialCharacters(inflected, true);
    }
    const segments =
      this.idiomatic?.segments.map((s) => s) ||
      this.components.flatMap((c) => c.segments);
    let runningText = "";
    for (const segment of segments) {
      const trimmed = trimBaseText(runningText, segment.text);
      runningText =
        runningText.slice(0, runningText.length - trimmed.trimCount) +
        renderWithoutSpecialCharacters(trimmed.addition);
    }
    return runningText;
  }
}

export class GlossedTermComponent {
  constructor(public location: Location, public segments: GlossSegment[]) {}

  getLemma() {
    return renderWithoutSpecialCharacters(
      this.segments
        .filter((s) => s.segmentType === LEMMA_SEGMENT)
        .map((s) => s.text)
        .join(""),
      false
    );
  }
}

export type GlossSegment = LemmaSegment | InflectionSegment;

export class LemmaSegment {
  constructor(
    public location: Location,

    public text: string
  ) {}

  segmentType = LEMMA_SEGMENT;
}
export class InflectionSegment {
  constructor(
    public location: Location,

    public text: string
  ) {}

  segmentType = INFLECTION_SEGMENT;
}

export class IdiomaticGlossedTerm {
  constructor(
    public location: Location,
    public segments: GlossSegment[],
    public inflected: string | null = null
  ) {}
}

export class Padding {
  elementType = PADDING;

  constructor(public location: Location | null, public text: string) {}

  appendText(text: string) {
    this.text += text;
    return this;
  }

  getText() {
    return renderWithoutSpecialCharacters(this.text, true);
  }
}

const splitAtTildesInclusive = /(~)/;

function trimBaseText(base: string, addition: string) {
  const hyphensMatch = addition.match(initialHyphens);
  if (hyphensMatch) {
    const [, leadingHyphens, afterHyphens] = hyphensMatch;
    return {
      trimCount: leadingHyphens.length,
      addition: afterHyphens,
    };
  }
  if (base.endsWith("~")) {
    return {
      trimCount: 1,
      addition,
    };
  }
  return { trimCount: 0, addition };
}

function renderText(
  element: TranslationElement["glossElement"],
  prevElement: TranslationElement["glossElement"] | null
) {
  // TODO: saidokumoji
  const newText = element.getText();
  const prevText = prevElement?.getText();
  const leading =
    !prevText ||
    endPunctuationAtStart.test(newText) ||
    whitespaceAtEnd.test(prevText) ||
    startsWithTilde(element) ||
    (prevElement && endsWithTilde(prevElement))
      ? ""
      : " ";

  return leading + newText;
}
function startsWithTilde(element: Padding | GlossedTerm) {
  if (element.elementType === PADDING) {
    return element.text.startsWith("~");
  }
  if (element.elementType === GLOSSED_TERM) {
    if (element.idiomatic) {
      return element.idiomatic.segments[0]?.text.startsWith("~");
    } else if (element.inflected) {
      return element.inflected.startsWith("~");
    }
    return element.components[0].segments[0]?.text.startsWith("~");
  }

  throw new Error("Unknown element type");
}
function endsWithTilde(element: Padding | GlossedTerm) {
  if (element.elementType === PADDING) {
    return element.text.endsWith("~");
  }
  if (element.elementType === GLOSSED_TERM) {
    if (element.idiomatic) {
      return (
        element.idiomatic.segments[
          element.idiomatic.segments.length - 1
        ]?.text.endsWith("~") || false
      );
    } else if (element.components.length > 0) {
      const lastComponent = element.components[element.components.length - 1];
      return (
        lastComponent.segments[
          lastComponent.segments.length - 1
        ]?.text.endsWith("~") || false
      );
    }
  }

  throw new Error("Unknown element type");
}

const initialHyphens = /^(-+)(.*)/;
const endPunctuationAtEnd = /[.!?,;\n\r]$|--$/;
const endPunctuationAtStart = /^[.!?,;\n\r]|^--/;
const whitespaceAtEnd = /\s$/;
const nonspaceEndPunctuationAtEnd = /[.!?,;]$|--$/;
const nonspaceEndPunctuationAtStart = /^[.!?,;]|^--/;

const underscoresAnywhere = /(?<!\\)_/g;
const capsCaratsAnywhere = /(?<!\\)\^([a-z])/g;
const backslashesAnywhere = /\\/g;
const tildesAnywhere = /~/g;
function renderWithoutSpecialCharacters(string: string, capitalize = true) {
  return string
    .replace(underscoresAnywhere, " ")
    .replace(
      capsCaratsAnywhere,
      capitalize ? (_, c) => c.toUpperCase() : (_, c) => c
    )
    .replace(backslashesAnywhere, "")
    .replace(tildesAnywhere, "");
}

export type TranslationElement = {
  glossElement: GlossedTerm | Padding;
  renderedText: string;
};
