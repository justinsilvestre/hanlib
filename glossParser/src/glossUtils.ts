const GLOSSED_TERM = "GlossedTerm" as const;
const LEMMA_SEGMENT = "LemmaSegment" as const;
const INFLECTION_SEGMENT = "InflectionSegment" as const;
const PADDING = "Padding" as const;
const GLOSS_ELEMENT = "GlossElement" as const;

// TODO: initial quotes/delimiter and carat

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
  public delimitersAfterReordering: Map<GlossElementSequence, string> =
    new Map();

  constructor(public sequences: GlossElementSequence[]) {}

  getTermComponents() {
    const components = this.sequences.flatMap((s) => {
      return s.elements
        .map((e) => {
          return e.term.components.map((c) => ({
            parent: e.term,
            term: c,
          }));
        })
        .flat();
    });

    return {
      components,
      indexes: new Map(components.map((c, i) => [c.term, i] as const)),
    };
  }

  orderByTranslation() {
    const translationElements: GlossElementSequence[] = [];

    let pendingNumberedSequences: NumberedGlossElementSequence[] = [];
    // let pendingArrowSequences: {first:GlossElementSequence, second: GlossElementSequence}[] = [];
    /** First to second */
    const pendingArrowSequences = new Map<
      GlossElementSequence,
      GlossElementSequence
    >();
    const resolveSequenceAndArrows = (
      element: GlossElementSequence,
      endingDelimiterSource: GlossElementSequence
    ) => {
      translationElements.push(element);

      const next = pendingArrowSequences.get(element);
      if (next) {
        pendingArrowSequences.delete(element);
        resolveSequenceAndArrows(next, endingDelimiterSource);
      } else if (
        element !== endingDelimiterSource &&
        endingDelimiterSource.delimiterBeforeReordering
      ) {
        this.delimitersAfterReordering.set(endingDelimiterSource, "");
        this.delimitersAfterReordering.set(
          element,
          endingDelimiterSource.delimiterBeforeReordering
        );
      }
    };

    for (let i = 0; i < this.sequences.length; i++) {
      const sequence = this.sequences[i];
      if (isReorderedGlossElementSequence(sequence)) {
        pendingNumberedSequences.push(sequence);

        if (sequence.order === 1) {
          pendingNumberedSequences.sort((a, b) => a.order - b.order);

          this.delimitersAfterReordering.set(pendingNumberedSequences[0], "");
          this.delimitersAfterReordering.set(
            pendingNumberedSequences[pendingNumberedSequences.length - 1],
            pendingNumberedSequences[0].delimiterBeforeReordering
          );

          for (const p of pendingNumberedSequences) {
            resolveSequenceAndArrows(p, p);
          }
          pendingNumberedSequences = [];
        }
      } else if (sequence.order === ">") {
        const nextSequence = this.sequences[i + 1];
        if (nextSequence) pendingArrowSequences.set(nextSequence, sequence);
        else {
          resolveSequenceAndArrows(sequence, sequence);
        }
      } else {
        resolveSequenceAndArrows(sequence, sequence);
      }
    }

    if (pendingNumberedSequences.length) {
      pendingNumberedSequences.sort((a, b) => a.order - b.order);
      for (const p of pendingNumberedSequences) {
        translationElements.push(p);
      }
    }

    return translationElements;
  }

  renderTranslation() {
    const translationElements: (Padding | GlossedTerm)[] = [];
    for (const sequence of this.orderByTranslation()) {
      for (const e of sequence.elements) {
        if (e.prePadding) translationElements.push(e.prePadding);

        translationElements.push(e.term);

        if (e.postPadding?.text) translationElements.push(e.postPadding);
      }
      const delimiter =
        this.delimitersAfterReordering.get(sequence) ??
        sequence.delimiterBeforeReordering;

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

type NumberedGlossElementSequence = GlossElementSequence & { order: number };
function isReorderedGlossElementSequence(
  sequence: GlossElementSequence
): sequence is NumberedGlossElementSequence {
  return typeof sequence.order === "number";
}

export class GlossElement {
  elementType = GLOSS_ELEMENT;

  constructor(
    public location: Location,
    public originalTerm: string,
    public prePadding: Padding | null,
    public term: GlossedTerm,
    public postPadding: Padding | null
  ) {}
}

export class GlossElementSequence {
  constructor(
    public location: Location,
    public elements: GlossElement[],
    public delimiterBeforeReordering: string,
    public order: number | ">" | null = null
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
