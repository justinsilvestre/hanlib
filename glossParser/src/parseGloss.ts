import { parse } from "../build/glossParser";
import { GlossDocument, GlossElement } from "./glossUtils";

export type ParsedGloss =
  | {
      ok: true;
      ast: GlossDocument;
      translation: GlossElement[];
      original: string;
      error?: undefined;
    }
  | {
      ok: false;
      ast?: GlossDocument | undefined;
      error: {
        message: string;
        location: { line: number; column: number; offset: number };
        expected: string;
        found: string;
        original: any;
      };
    };

export default function parseGloss(gloss: string): ParsedGloss {
  if (!gloss?.trim())
    return {
      ok: true,
      ast: new GlossDocument([]),
      translation: [],
    };

  let ast: GlossDocument | undefined = undefined;

  try {
    ast = parse(gloss) as GlossDocument;
    let _translation: GlossElement[];
    let _original: string;
    return {
      ast,
      get translation() {
        if (!_translation) {
          _translation = ast!.orderByTranslation().flatMap((el) => el.elements);
        }
        return _translation;
      },

      get original() {
        if (!_original) {
          _original =
            ast?.sequences
              .flatMap((s) => s.elements.flatMap((e) => e.originalTerm))
              .join("") || "";
        }
        return _original;
      },

      ok: true,
    };
  } catch (err) {
    return {
      ok: false,
      ast,
      error: {
        message: (err as any).message,
        location: (err as any).location?.start,
        found: (err as any).found,
        expected: (err as any).expected,
        original: err,
      },
    };
  }
}
