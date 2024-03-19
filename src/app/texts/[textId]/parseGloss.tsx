"use client";
import { parse } from "@/app/glossParser";
import { GlossDocument } from "@/app/glossUtils";

export function parseGloss(glossText: string | null) {
  if (!glossText) return { ok: true, result: null };
  try {
    return { ok: true, result: parse(glossText) as GlossDocument };
  } catch (e) {
    return { ok: false, result: null, error: e };
  }
}
