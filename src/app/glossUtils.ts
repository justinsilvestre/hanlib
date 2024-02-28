const GLOSSED_TERM = "GlossedTerm" as const;
const LEMMA_SEGMENT = "LemmaSegment" as const;
const INFLECTION_SEGMENT = "InflectionSegment" as const;
const PADDING = "Padding" as const;
const REORDERED_GLOSS_SEGMENT = "ReorderedGlossSegment" as const;

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
  constructor(public phrases: Phrase[]) {}

  getTermComponents() {
    const components = this.phrases.flatMap((p) =>
      p.elements.flatMap((e) => {
        if (e.elementType === "Padding") return [];
        if (e.elementType === "ReorderedGlossSegment")
          return e.term.components.map((c) => ({
            parent: e.term,
            term: c,
          }));
        return e.components.map((c) => ({
          parent: e,
          term: c,
        }));
      })
    );
    return {
      components,
      indexes: new Map(components.map((c, i) => [c.term, i] as const)),
    };
  }

  orderByTranslation() {
    const translationElements: (GlossedTerm | Padding)[] = [];
    let pendingNumberedGlosses: ReorderedGlossSegment[] = [];

    for (const phrase of this.phrases) {
      if (phrase.prePunctuation) {
        translationElements.push(new Padding(null, phrase.prePunctuation));
      }
      for (const element of phrase.elements) {
        if (element.elementType === REORDERED_GLOSS_SEGMENT) {
          pendingNumberedGlosses.push(element);

          if (element.number === 1) {
            pendingNumberedGlosses.sort((a, b) => {
              return a.number - b.number;
            });
            for (const pending of pendingNumberedGlosses) {
              if (pending.prePadding)
                translationElements.push(pending.prePadding);
              translationElements.push(pending.term);
              if (pending.postPadding)
                translationElements.push(pending.postPadding);
            }
            pendingNumberedGlosses = [];
          }
        } else {
          translationElements.push(element);
        }
      }
      if (phrase.postPunctuation) {
        translationElements.push(new Padding(null, phrase.postPunctuation));
      }
    }

    if (pendingNumberedGlosses.length) {
      pendingNumberedGlosses.sort((a, b) => {
        return a.number - b.number;
      });
      for (const pending of pendingNumberedGlosses) {
        if (pending.prePadding) translationElements.push(pending.prePadding);
        translationElements.push(pending.term);
        if (pending.postPadding) translationElements.push(pending.postPadding);
      }
    }

    return translationElements;
  }

  renderTranslation() {
    return this.orderByTranslation().reduce(
      (acc, e) => {
        const { runningText, translationElements } = acc;
        switch (e.elementType) {
          case "GlossedTerm": {
            const rendered = renderTermText(
              e,
              runningText,
              runningText.length &&
                !runningText.endsWith(" ") &&
                !runningText.endsWith(' "') &&
                !endPunctuationAtEnd.test(runningText)
                ? " "
                : ""
            );
            acc.runningText = rendered.base + rendered.addition;
            translationElements.push({
              glossElement: e,
              renderedText: rendered.addition,
            });
            return acc;
          }
          case "Padding": {
            const rendered = renderText(
              runningText,
              e.text,
              runningText.length &&
                !runningText.endsWith(" ") &&
                !runningText.endsWith(' "') &&
                !endPunctuationAtStart.test(e.text) &&
                !endPunctuationAtEnd.test(runningText)
                ? " "
                : ""
            );
            acc.runningText = rendered.base + rendered.addition;
            translationElements.push({
              glossElement: e,
              renderedText: rendered.addition,
            });
            return acc;
          }
        }
      },
      {
        runningText: "",
        translationElements: [] as TranslationElement[],
      }
    );
  }
}

export class Phrase {
  constructor(
    public location: Location,
    public elements: GlossElement[],
    public prePunctuation?: string,
    public postPunctuation?: string
  ) {}
}

export type GlossElement = ReorderedGlossSegment | GlossedTerm | Padding;

export class ReorderedGlossSegment {
  elementType = REORDERED_GLOSS_SEGMENT;

  constructor(
    public location: Location,
    public number: number,
    public prePadding: Padding | null,
    public term: GlossedTerm,
    public postPadding: Padding | null
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
    return renderWithoutUnderscoresCaratsAndBackslashes(
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
      ? renderWithoutUnderscoresCaratsAndBackslashes(
          this.idiomatic.segments
            .filter((s) => s.segmentType === LEMMA_SEGMENT)
            .map((s) => s.text)
            .join(""),
          false
        )
      : null;
  }
}

export class GlossedTermComponent {
  constructor(public location: Location, public segments: GlossSegment[]) {}

  getLemma() {
    return renderWithoutUnderscoresCaratsAndBackslashes(
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

  constructor(
    public location: Location | null,

    public text: string
  ) {}
}

const splitAtTildesInclusive = /(~)/;
function renderText(base: string, addition: string, leading = "") {
  // TODO: saidokumoji

  if (addition.startsWith("~")) {
    return {
      base,
      addition: renderWithoutUnderscoresCaratsAndBackslashes(addition.slice(1)),
    };
  }
  const hyphensMatch = addition.match(initialHyphens);
  const [, leadingHyphens, afterHyphens] = hyphensMatch! || [, "", addition];
  const baseTrimmed = hyphensMatch
    ? base.slice(0, -leadingHyphens.length)
    : base;
  return {
    base: baseTrimmed,
    addition:
      leading + renderWithoutUnderscoresCaratsAndBackslashes(afterHyphens),
  };
}

function renderTermText(term: GlossedTerm, base = "", leading = "") {
  const inflected = term.idiomatic?.inflected || term.inflected;

  if (inflected) {
    return renderText(base, inflected, leading);
  }

  const segments =
    term.idiomatic?.segments.map((s) => s) ||
    term.components.flatMap((c) => c.segments);
  return {
    base,
    addition: segments.reduce((acc, s, i) => {
      const { base, addition } = renderText(
        acc,
        s.text,
        i === 0 ? leading : ""
      );
      return base + addition;
    }, ""),
  };
}

const initialHyphens = /^(-+)(.*)/;
const endPunctuationAtEnd = /[.!?,;\n\r]$|--$/;
const endPunctuationAtStart = /^[.!?,;\n\r]|^--/;

const underscoresAnywhere = /(?<!\\)_/g;
const capsCaratsAnywhere = /(?<!\\)\^([a-z])/g;
const backslashesAnywhere = /\\/g;
function renderWithoutUnderscoresCaratsAndBackslashes(
  string: string,
  capitalize = true
) {
  return string
    .replace(underscoresAnywhere, " ")
    .replace(
      capsCaratsAnywhere,
      capitalize ? (_, c) => c.toUpperCase() : (_, c) => c
    )
    .replace(backslashesAnywhere, "");
}

export type TranslationElement = {
  glossElement: GlossedTerm | Padding;
  renderedText: string;
};
