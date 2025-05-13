// @ts-expect-error
import { parse } from "../build/glossParser";
import { GlossDocument, GlossElement } from "./glossUtils";

export type ParsedGloss =
  | {
      ok: true;
      ast: GlossDocument;
      translation: GlossElement[];
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
    let _translation: ReturnType<GlossDocument["orderByTranslation"]>;
    return {
      ast,
      get translation() {
        if (!_translation) {
          _translation = ast!.orderByTranslation();
        }
        return _translation;
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
