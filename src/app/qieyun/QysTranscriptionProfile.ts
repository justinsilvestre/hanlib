import { QieyunRhymeCycleHead } from "./QieyunRhymeCycleHead";
import { QysInitial } from "./QysInitial";
import { DengOrChongniu } from "./QysSyllableProfile";

export interface QysTranscriptionProfile {
  is合口: boolean;
  canonical母: QysInitial;
  tone聲: "平" | "上" | "去" | "入";
  is重紐A類: boolean;
  qieyunCycleHead韻: QieyunRhymeCycleHead;
  contrastiveRow等: DengOrChongniu | null;
}

// below adapted from https://github.com/nk2028/qieyun-js/blob/main/src/lib/%E9%9F%B3%E9%9F%BB%E5%9C%B0%E4%BD%8D.ts
// license: https://github.com/nk2028/qieyun-js/tree/main?tab=CC0-1.0-1-ov-file#readme

const 所有母 =
  "幫滂並明端透定泥來知徹澄孃精清從心邪莊初崇生俟章昌常書船日見溪羣疑影曉匣云以";
const 所有呼 = "開合";
const 所有等 = "一二三四";
const 所有重紐 = "AB";
const 所有韻 =
  "東冬鍾江支脂之微魚虞模齊祭泰佳皆夬灰咍廢眞臻文欣元魂痕寒刪山仙先蕭宵肴豪歌麻陽唐庚耕清青蒸登尤侯幽侵覃談鹽添咸銜嚴凡";
const 所有聲 = "平上去入";

export const 重紐母 = [..."幫滂並明見溪羣疑影曉匣"] as const;
export const 重紐韻 = [..."支脂祭眞仙宵侵鹽"] as const;

export const 開合皆有的韻 = [
  ..."支脂微齊祭泰佳皆夬廢眞元寒刪山仙先歌麻陽唐庚耕清青蒸登",
] as const;
export const 必為開口的韻 = [
  ..."咍痕欣嚴之魚臻蕭宵肴豪侯侵覃談鹽添咸銜",
] as const;
export const 必為合口的韻 = [..."灰魂文凡"] as const;
export const 開合中立的韻 = [..."東冬鍾江虞模尤幽"] as const;

const 一等韻 = "冬模泰咍灰痕魂寒豪唐登侯覃談";
const 二等韻 = "江佳皆夬刪山肴耕咸銜";
const 三等韻 = "鍾支脂之微魚虞祭廢眞臻欣元文仙宵陽清蒸尤幽侵鹽嚴凡";
const 四等韻 = "齊先蕭青添";

const pattern = new RegExp(
  `^([${所有母}])([${所有呼}]?)([${所有等}]?)([${所有重紐}]?)([${所有韻}])([${所有聲}])$`,
  "u"
);
export function getQysTranscriptionProfile(
  音韻描述: string
): QysTranscriptionProfile {
  const match = pattern.exec(音韻描述);
  if (!match) throw new Error(`Problem reading profile ${音韻描述}`);

  const 母 = match[1];
  let 呼 = match[2] || null;
  let 等 = match[3] || null;
  const 重紐 = match[4] || null;
  const 韻 = match[5];
  const 聲 = match[6];

  if (呼 == null && ![..."幫滂並明"].includes(母)) {
    if (必為開口的韻.includes(韻)) 呼 = "開";
    else if (必為合口的韻.includes(韻)) 呼 = "合";
  }

  if (等 == null) {
    if ([...一等韻].includes(韻)) 等 = "一";
    else if ([...二等韻].includes(韻)) 等 = "二";
    else if ([...三等韻].includes(韻)) 等 = "三";
    else if ([...四等韻].includes(韻)) 等 = "四";
  }

  return {
    is合口: 呼 === "合",
    canonical母: 母 as QysInitial,
    tone聲: 聲 as "平" | "上" | "去" | "入",
    is重紐A類: 重紐 === "A",
    qieyunCycleHead韻: 韻 as QieyunRhymeCycleHead,
    contrastiveRow等: 等 as DengOrChongniu | null,
  };
}
