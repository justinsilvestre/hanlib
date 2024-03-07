import type { QieyunRhymeCycleHead } from "./QieyunRhymeCycleHead";
import type { QysInitial } from "./QysInitial";

export type DengOrChongniu = "一" | "二" | "三" | "四" | "A" | "B";
export enum Kaihe {
  Open = "開",
  Closed = "合",
}

export enum Tone {
  平 = "平",
  上 = "上",
  去 = "去",
  入 = "入",
}

export interface QysSyllableProfile {
  initial: QysInitial;
  dengOrChongniu: DengOrChongniu | null;
  kaihe: Kaihe | null;
  tone: Tone;
  cycleHead: QieyunRhymeCycleHead;
}
