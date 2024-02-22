export type TranslationElement =
  | {
      type: "CharacterGloss";
      segments: TranslationElementSegment[];
      characterIndex: number;
      character: CharacterGloss;
    }
  | {
      type: "CompoundGloss";
      segments: TranslationElementSegment[];
      compound: CompoundGloss;
      characterIndexes: CharacterIndexesRange;
    }
  | {
      type: "Padding";
      position: "Pre" | "Post";
      core: "CharacterGloss" | "Group";
      segments: [TranslationElementSegment];
    }
  | {
      type: "EndPunctuation";
      segments: [TranslationElementSegment];
    };
type TranslationElementSegment = {
  type: "GlossComponent" | "Padding" | "EndPunctuation";
  text: string;
};
export const NodeTypes = {
  CharacterGloss: "CharacterGloss",
  Padding: "Padding",
  CompoundGloss: "CompoundGloss",
  GlossSegment: "GlossSegment",
} as const;

function toTranslationElement(
  gloss: CharacterGloss | CompoundGloss,
  indexesRange: CharacterIndexesRange
): TranslationElement {
  switch (gloss.type) {
    case NodeTypes.CharacterGloss:
      return {
        type: NodeTypes.CharacterGloss,
        segments: gloss.display(),
        character: gloss,
        characterIndex: indexesRange[0],
      };
    case NodeTypes.CompoundGloss:
      return {
        type: NodeTypes.CompoundGloss,
        segments: gloss.display(),
        compound: gloss,
        characterIndexes: indexesRange,
      };
  }
}

function isGloss(el?: TranslationElement) {
  return el && (el.type === "CharacterGloss" || el.type === "CompoundGloss");
}

function isSentenceEndPunctuation(text?: string) {
  return Boolean(text && /[\.\?!\n\r]/.test(text));
}

type MapTranslationElementFn<T> = (
  element: TranslationElement,
  leadingSpace: string,
  capitalizedTranslation: TranslationElementSegment[],
  translationElementIndex: number
) => T;

const getTranslationElementText: MapTranslationElementFn<string> = (
  element,
  leadingSpace,
  capitalizedTranslation
) => {
  return leadingSpace + capitalizedTranslation.map((t) => t.text).join("");
};

export type TranslateOptions<T, U> = {
  mapTranslationElementFn: MapTranslationElementFn<T>;
  combineElements: (base: U, addition: T) => U;
  base: U;
};

const defaultTranslateOptions = {
  mapTranslationElementFn: getTranslationElementText,
  combineElements: (base: string, addition: string) => base + addition,
  base: "",
} as const;
type CharacterIndexesRange = [first: number, last: number];

function getRenderTranslation(translation: TranslationElement[]) {
  return function translate<T = string, U = string>(
    translateOptions?: TranslateOptions<T, U>
  ): U {
    const options =
      translateOptions ||
      (defaultTranslateOptions as unknown as TranslateOptions<T, U>);
    let translationText = options.base;
    let translationElementIndex = 0;
    for (const currentElement of translation) {
      let previousElement = translation[translationElementIndex - 1];
      let nextElement = translation[translationElementIndex + 1];

      const previousElementText = previousElement?.segments
        .map((s) => s.text)
        .join("");
      const currentElementText = currentElement?.segments
        .map((s) => s.text)
        .join("");

      const doCapitalize = Boolean(
        !previousElement || isSentenceEndPunctuation(previousElementText)
      );

      const currentElementSegmentsWithoutTilde = currentElement.segments.reduce(
        (acc, segment, i) => {
          if (segment.text.startsWith("~")) {
            return [
              ...acc.slice(0, -1),
              ...(acc[acc.length - 1]
                ? [
                    {
                      ...acc[acc.length - 1],
                      text: acc[acc.length - 1].text.replace(/[ \t]+$/, ""),
                    },
                  ]
                : []),
              {
                ...segment,
                text: segment.text.slice(1),
              },
            ];
          }
          return [...acc, segment];
        },
        [] as TranslationElementSegment[]
      );

      const leadingSpace =
        !previousElement ||
        currentElement.type === "EndPunctuation" ||
        /^[~ ]/.test(currentElementText) ||
        /(--|\n)/.test(previousElementText)
          ? ""
          : previousElementText.endsWith(" ")
          ? ""
          : " ";

      const shouldDeleteCurrentTrailingSpace =
        nextElement?.type === "EndPunctuation" ||
        (isGloss(nextElement) && /^[\s~]/.test(nextElement.segments[0].text));

      const lastOfCurrentElementSegmentsWithoutTilde =
        currentElementSegmentsWithoutTilde[
          currentElementSegmentsWithoutTilde.length - 1
        ];
      const currentElementSegmentsBeforeCapitalization =
        shouldDeleteCurrentTrailingSpace
          ? [
              ...currentElementSegmentsWithoutTilde.slice(0, -1),
              ...(lastOfCurrentElementSegmentsWithoutTilde
                ? [
                    {
                      ...lastOfCurrentElementSegmentsWithoutTilde,
                      text: lastOfCurrentElementSegmentsWithoutTilde.text.replace(
                        /[ \t]+$/g,
                        ""
                      ),
                    },
                  ]
                : []),
            ]
          : currentElementSegmentsWithoutTilde;
      const toCapitalize = doCapitalize
        ? currentElementSegmentsBeforeCapitalization.findIndex(
            (segment) => segment.text.search(/[a-z]/i) !== -1
          )
        : -1;

      const currentElementSegmentsAfterCapitalization =
        toCapitalize !== -1
          ? [
              ...currentElementSegmentsBeforeCapitalization.slice(
                0,
                toCapitalize
              ),
              {
                ...currentElementSegmentsBeforeCapitalization[toCapitalize],
                text: capitalizeFirstLetter(
                  currentElementSegmentsBeforeCapitalization[toCapitalize].text
                ),
              },
              ...currentElementSegmentsBeforeCapitalization.slice(
                toCapitalize + 1
              ),
            ]
          : currentElementSegmentsBeforeCapitalization;
      const currentElementDisplay = options.mapTranslationElementFn(
        currentElement,
        leadingSpace,
        currentElementSegmentsAfterCapitalization,
        translationElementIndex
      );
      translationText = options.combineElements(
        translationText,
        currentElementDisplay
      );

      translationElementIndex += 1;
    }
    return translationText;
  };
}

export type DocumentCharacter = {
  character: CharacterGloss;
  indexInDocument: number;
  group: GlossGroup;
};

/***************** *****************/
/***************** *****************/
/***************** *****************/
/***************** *****************/
export class GlossDocument {
  groups: GlossGroup[];
  characters: DocumentCharacter[];
  compounds: { [location: string]: CompoundGloss };

  constructor(groups: GlossGroup[]) {
    this.groups = groups;
    const { characters, compounds } =
      this._initializeCharactersAndCompounds(groups);
    this.compounds = compounds;
    this.characters = characters;
  }

  /** mutates groups */
  _initializeCharactersAndCompounds(groups: GlossGroup[]) {
    let runningCharacterIndexStartForGroup = 0;
    const compounds = {};
    const characters = groups
      .map((group) => {
        Object.assign(compounds, group.compounds);
        group.registerInDocument(runningCharacterIndexStartForGroup);
        runningCharacterIndexStartForGroup += group.characters.length;
        return group.characters.map((character, i) => ({
          indexInDocument: i + group.firstCharacterIndexInDocument,
          character,
          group,
        }));
      })
      .flat(1);
    return { characters, compounds };
  }

  getCompound(location: string) {
    return this.compounds[location];
  }

  getCharacter(index: number): DocumentCharacter | null {
    return this.characters[index] || null;
  }

  getGroupCharacter(group: GlossGroup, groupCharacterIndex: number) {
    return this.characters[
      group.firstCharacterIndexInDocument + groupCharacterIndex
    ];
  }

  flatmapCharacters<T>(
    callback: (
      gloss: CharacterGloss,
      index: number,
      group: GlossGroup,
      groupIndex: number
    ) => T[]
  ): T[] {
    return this.groups.flatMap((group, gi) =>
      group.characters.flatMap((c, ci) => callback(c, ci, group, gi))
    );
  }

  flatmapLines<T>(
    callback: (line: GlossGroup[], lineIndex: number) => T[] | T
  ): T[] {
    let result: T[] = [];
    let nextLine: GlossGroup[] = [];
    let lineIndex = 0;
    let groupIndex = 0;
    const lastGroupIndex = this.groups.length - 1;
    for (const group of this.groups) {
      const endPunctuation = group.endPunctuation!;
      nextLine.push(group);
      if (groupIndex === lastGroupIndex || /\n/.test(endPunctuation)) {
        const next = callback(nextLine, lineIndex);
        Array.isArray(next) ? result.push(...next) : result.push(next);
        nextLine = [];
        lineIndex += 1;
      }

      groupIndex += 1;
    }
    return result;
  }

  getTranslation() {
    let translation: TranslationElement[] = [];
    let pendingNumberedGlosses: {
      glossNumber: number;
      element: TranslationElement;
    }[] = [];
    let resolvedCompounds = new Set<CompoundGloss>();

    for (const group of this.groups) {
      if (group.prePadding) {
        translation.push({
          type: "Padding",
          segments: [
            {
              type: "Padding",
              text: convertUnderscoresAndBackslashes(group.prePadding),
            },
          ],
          position: "Pre",
          core: "Group",
        });
      }

      let i = 0;
      for (const character of group.characters) {
        const groupCharacterIndex = i;
        const compoundContainingCharacter = character.compoundLocation
          ? group.compounds[character.compoundLocation]
          : null;
        const glossIsUnresolved =
          !compoundContainingCharacter ||
          !resolvedCompounds.has(compoundContainingCharacter);
        if (compoundContainingCharacter && glossIsUnresolved)
          resolvedCompounds.add(compoundContainingCharacter);
        const unresolvedCharactersInCompoundCount =
          compoundContainingCharacter && glossIsUnresolved
            ? compoundContainingCharacter.components.length
            : 0;
        const currentGlossCharactersCount = compoundContainingCharacter
          ? unresolvedCharactersInCompoundCount
          : 1;
        if (glossIsUnresolved) {
          i += currentGlossCharactersCount;
        }
        const groupCharacter = this.getGroupCharacter(
          group,
          groupCharacterIndex
        );
        const unresolvedGloss = glossIsUnresolved
          ? compoundContainingCharacter || character
          : null;
        const startIndex = groupCharacter?.indexInDocument ?? -1;
        const endIndex = unresolvedGloss
          ? startIndex + currentGlossCharactersCount - 1
          : startIndex;

        if (unresolvedGloss?.number) {
          pendingNumberedGlosses.push({
            glossNumber: unresolvedGloss.number,
            element: toTranslationElement(unresolvedGloss, [
              startIndex,
              endIndex,
            ]),
          });
          if (unresolvedGloss.number == 1) {
            pendingNumberedGlosses.sort(
              (a, b) => a.glossNumber! - b.glossNumber!
            );

            for (const unresolvedNumberedGloss of pendingNumberedGlosses) {
              translation.push(unresolvedNumberedGloss.element);
            }
            pendingNumberedGlosses = [];
          }
        } else if (unresolvedGloss) {
          try {
            translation.push(
              toTranslationElement(unresolvedGloss, [startIndex, endIndex])
            );
          } catch (err) {
            console.error(err);
            throw new Error(
              `Problem displaying character at column ${character.column}: ${err}`
            );
          }
        }
      }

      if (group.postPadding) {
        translation.push({
          type: "Padding",
          segments: [
            {
              type: "Padding",
              text: convertUnderscoresAndBackslashes(group.postPadding),
            },
          ],
          position: "Post",
          core: "Group",
        });
      }

      if (group.endPunctuation)
        translation.push({
          type: "EndPunctuation",
          segments: [
            {
              type: "EndPunctuation",
              text: convertUnderscoresAndBackslashes(group.endPunctuation),
            },
          ],
        });
    }

    return {
      translation,
      renderTranslation: getRenderTranslation(translation),
    };
  }
}

type Padding = string;

export class GlossGroup {
  characters: CharacterGloss[];
  compounds: { [location: string]: CompoundGloss };
  endPunctuation?: string;

  prePadding?: Padding;
  postPadding?: Padding;

  /** set as last step in parser */
  firstCharacterIndexInDocument: number = 0;

  constructor({
    characters,
    compounds = {},
    endPunctuation,
    prePadding,
    postPadding,
  }: {
    characters: CharacterGloss[];
    compounds?: { [location: string]: CompoundGloss };
    endPunctuation?: string;
    prePadding?: Padding;
    postPadding?: Padding;
  }) {
    this.characters = characters;
    this.compounds = compounds;
    this.endPunctuation = endPunctuation;
    this.prePadding = prePadding;
    this.postPadding = postPadding;
  }

  addCompound(gloss: CompoundGloss) {
    this.compounds[gloss.location] = gloss;
  }

  registerInDocument(firstCharacterIndexInDocument: number) {
    this.firstCharacterIndexInDocument = firstCharacterIndexInDocument;
  }
}

type TransformFn<T> = (glossSegments: {
  pre: string;
  core: string;
  post: string;
}) => T;
function glossToString({
  pre,
  core,
  post,
}: {
  pre: string;
  core: string;
  post: string;
}) {
  return `${pre}${core}${post}`;
}
function glossToTranslationElementSegments({
  pre,
  core,
  post,
}: {
  pre: string;
  core: string;
  post: string;
}) {
  const segments = [];
  if (pre)
    segments.push({
      type: "Padding" as const,
      text: pre,
    });
  segments.push({
    type: "GlossComponent" as const,
    text: core,
  });
  if (post)
    segments.push({
      type: "Padding" as const,
      text: post,
    });

  return segments;
}
export class CompoundGloss {
  components: CharacterGloss[];
  meaning: GlossSegment[];

  number?: number;
  location: string;
  line: number;
  column: number;

  type = NodeTypes.CompoundGloss;

  constructor({
    components,
    meaning,
    location,
    number,
  }: Pick<CompoundGloss, "components" | "meaning" | "number"> & {
    location: [line: number, column: number];
  }) {
    this.number = number;
    this.components = components;
    this.meaning = meaning;
    this.location = String(location);
    const [line, column] = location;
    this.line = line;
    this.column = column;
  }

  display() {
    return glossToTranslationElementSegments(
      displayGlossText(
        this.meaning,
        this.components[0].prePadding || undefined,
        this.postPadding || undefined
      )
    );
  }

  get postPadding() {
    return this.components[this.components.length - 1].postPadding;
  }
}

export class CharacterGloss {
  type = NodeTypes.CharacterGloss;

  segments: GlossSegment[];
  idiomatic: GlossSegment[] | null;
  number?: number;
  location: string;
  line: number;
  column: number;

  compoundLocation?: string;
  prePadding?: Padding | null;
  postPadding?: Padding | null;

  constructor({
    segments,
    idiomatic = null,
    location,
    compoundLocation,
    prePadding,
    postPadding,
  }: {
    segments: GlossSegment[];
    idiomatic?: GlossSegment[] | null;
    location: [line: number, column: number];
    compoundLocation?: string;
    prePadding?: Padding;
    postPadding?: Padding;
  }) {
    this.segments = segments;
    this.idiomatic = idiomatic;
    this.compoundLocation = compoundLocation;
    this.prePadding = prePadding;
    this.postPadding = postPadding;
    const [line, column] = location;
    this.location = String(location);
    this.line = line;
    this.column = column;
  }

  amend(opts: Partial<CharacterGloss>) {
    for (const optName in opts) {
      if (typeof opts[optName as keyof CharacterGloss] !== "undefined") {
        // @ts-ignore
        this[optName as keyof CharacterGloss] =
          opts[optName as keyof CharacterGloss];
      }
    }
    return this;
  }

  attachToCompound(location: [number, number]) {
    this.compoundLocation = String(location);
    return this;
  }

  display() {
    return glossToTranslationElementSegments(
      displayGlossText(
        this.idiomatic || this.segments,
        this.prePadding || undefined,
        this.postPadding || undefined
      )
    );
  }

  getLemma() {
    return displaySegments(this.segments);
  }

  getIdiomaticLemma() {
    return this.idiomatic && displaySegments(this.idiomatic);
  }
}

function displaySegments(segments: GlossSegment[]) {
  return segments
    .flatMap((el) =>
      el.role === "LemmaComponent"
        ? el.text.replace(/\\{1,1}/gu, "").replace(/(?<!\\)_/g, " ")
        : []
    )
    .join("")
    .trim();
}

function displayGlossText(
  segments: GlossSegment[],
  prePadding: string = "",
  postPadding: string = ""
) {
  const adjustedPrePadding = prePadding.trim()
    ? prePadding.replace(/ +$/, "") +
      (prePadding.endsWith('"') || segments[0].text.startsWith("~aa")
        ? ""
        : " ")
    : "";
  const lastSegment = segments[segments.length - 1];
  const adjustedPostPadding = postPadding.trim()
    ? (lastSegment.text.startsWith("~") ? "" : " ") +
      postPadding.replace(/^ +/, "")
    : "";

  if (lastSegment.text.startsWith(":")) {
    return {
      pre: convertUnderscoresAndBackslashes(adjustedPrePadding),
      core: convertUnderscoresAndBackslashes(lastSegment.text.slice(1)),
      post: convertUnderscoresAndBackslashes(adjustedPostPadding),
    };
  }

  return {
    pre: convertUnderscoresAndBackslashes(adjustedPrePadding),
    core: convertUnderscoresAndBackslashes(
      segments.reduce((text, segment) => {
        const backtrack =
          segment.role === GlossSegmentRoles.Inflection &&
          segment.text.match(/^(-+)(.+)/);

        const base = backtrack
          ? text.slice(0, text.length - backtrack?.[1].length)
          : text;
        const addition = backtrack ? backtrack[2] : segment.text;

        return base + addition;
      }, "")
    ),
    post: convertUnderscoresAndBackslashes(adjustedPostPadding),
  };
}

function convertUnderscoresAndBackslashes(string: string) {
  return string.replace(/[_]/g, " ").replace(/[\\]/g, "");
}

function capitalizeFirstLetter(string: string) {
  const letterIndex = string.search(/[a-z]/i);
  return letterIndex === -1
    ? string
    : string.slice(0, letterIndex) +
        string[letterIndex].toUpperCase() +
        string.slice(letterIndex + 1);
}

export const GlossSegmentRoles = {
  Inflection: "Inflection",
  LemmaComponent: "LemmaComponent",
} as const;
type GlossSegmentRole = keyof typeof GlossSegmentRoles;

export class GlossSegment {
  text: string;
  role: GlossSegmentRole;
  column: number;

  type = NodeTypes.GlossSegment;

  constructor({
    role,
    text,
    column,
  }: {
    role: GlossSegmentRole;
    text: string;
    column: number;
  }) {
    this.role = role;
    this.text = text;
    this.column = column;
  }
}
