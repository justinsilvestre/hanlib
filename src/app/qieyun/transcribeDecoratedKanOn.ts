// https://nk2028.shn.hk/qieyun-js/classes/____.html

import { initialGroups, getInitialGroup } from "./QysInitial";
import { Kaihe, QysSyllableProfile } from "./QysSyllableProfile";
import { QysTranscriptionProfile } from "./QysTranscriptionProfile";

function changeRuShengCoda(isRuSheng: boolean, final: string) {
  if (!isRuSheng) return final;
  if (final.endsWith("m")) return final.slice(0, -1) + "p";
  else if (final.endsWith("n")) return final.slice(0, -1) + "t";
  else if (final.endsWith("ng")) return final.slice(0, -2) + "k";
  else return final;
}

const asciiFinals = {
  iūng: "iuung",
  ūng: "uung",
  ūk: "uuk",
  yūk: "yuuk",
  ẁīk: "ywiik",
  wīk: "wiik",
  wōng: "woong",
  ōng: "oong",
  ong: "ong",
  wo: "wo",
  o: "o",
  wāi: "waai",
  āi: "aai",
  wai: "wai",
  ai: "ai",
  won: "won",
  on: "on",
  an: "an",
  wan: "wan",
  au: "au",
  wȧ: "wia",
  wa: "wa",
  ya: "ya",
  a: "a",
  wang: "wang",
  ang: "ang",
  wŏng: "wcong",
  ŏng: "cong",
  ou: "ou",
  am: "am",
  ām: "aam",
  ạ̊ng: "roang",
  wạ̈: "rwae",
  ạ̈: "rae",
  wạ̈i: "rwaei",
  ạ̈i: "raei",
  wại: "rwai",
  ại: "rai",
  wạn: "rwan",
  ạn: "ran",
  wạ̈n: "rwaen",
  ạ̈n: "raen",
  ạu: "rau",
  yạ: "yra",
  wạ: "rwa",
  ạ: "ra",
  wâng: "wvang",
  ŷang: "vyang",
  wẹng: "rweng",
  ẹng: "reng",
  wạng: "rwang",
  wạ̈ng: "rwaeng",
  ạng: "rang",
  ạ̈ng: "raeng",
  äm: "aem",
  ạm: "ram",
  wei: "wei",
  ei: "ei",
  em: "em",
  wen: "wen",
  en: "en",
  eu: "eu",
  weng: "weng",
  eng: "eng",
  uï: "uie",
  ẁï: "ywie",
  wï: "wie",
  yï: "yie",
  ï: "ie",
  i: "i",
  uī: "uii",
  ẁī: "ywii",
  wī: "wii",
  yī: "yii",
  ī: "ii",
  wî: "wvi",
  î: "vi",
  yo: "yo",
  iu: "iu",
  ạ̈m: "raem",
  u: "u",
  yu: "yu",
  ẁei: "ywei",
  wėi: "wiei",
  yei: "yei",
  ėi: "iei",
  âi: "vai",
  yeu: "yeu",
  ėu: "ieu",
  ū: "uu",
  iū: "iuu",
  ông: "vong",
  ŷong: "vyong",
  yūn: "yuun",
  ẁīn: "ywiin",
  wīn: "wiin",
  yīn: "yiin",
  īn: "iin",
  ịn: "rin",
  un: "un",
  in: "in",
  ân: "van",
  wên: "wven",
  ên: "ven",
  ẁen: "ywen",
  wėn: "wien",
  yen: "yen",
  ėn: "ien",
  âng: "vang",
  yang: "yang",
  ẁeng: "yweng",
  wėng: "wieng",
  yeng: "yeng",
  ėng: "ieng",
  wĭng: "wcing",
  ŷŏng: "vycong",
  yŏng: "ycong",
  yim: "yim",
  im: "im",
  yem: "yem",
  ėm: "iem",
  êm: "vem",
  âm: "vam",
};

const rhymes: Record<
  QieyunRhymeCycleHead,
  | keyof typeof asciiFinals
  | ((syllable: QysTranscriptionProfile) => keyof typeof asciiFinals)
> = {
  東: (s) => {
    if (s.tone聲 === "入" && s.contrastiveRow等 === "三") {
      if (initialGroups["幫"].has(s.canonical母)) return "ūk";
      if (s.canonical母 === "以") return "ẁīk";
      return initialGroups["莊"].has(s.canonical母) ||
        initialGroups["章"].has(s.canonical母) ||
        initialGroups["精"].has(s.canonical母)
        ? "yūk"
        : "wīk";
    }
    if (s.contrastiveRow等 === "三") {
      return initialGroups["幫"].has(s.canonical母) ? "ūng" : "iūng";
    }
    return s.canonical母 === "影" ? "wōng" : "ōng";
  },
  冬: "ong",
  模: (s) => (s.canonical母 === "影" ? "wo" : "o"),
  泰: (s) => (s.is合口 ? "wāi" : "āi"),
  灰: "wai",
  咍: "ai",
  魂: "won",
  痕: "on",
  寒: (s) => (s.is合口 ? "wan" : "an"),
  豪: "au",
  歌: (s) => {
    if (s.is合口) return s.contrastiveRow等 === "三" ? "wȧ" : "wa";
    return s.contrastiveRow等 === "三" ? "ya" : "a";
  },
  唐: (s) => (s.is合口 ? "wang" : "ang"),
  登: (s) => (s.is合口 ? "wŏng" : "ŏng"),
  侯: "ou",
  覃: "am",
  談: "ām",

  // 二等韻
  江: "ạ̊ng",
  佳: (s) => (s.is合口 ? "wạ̈" : "ạ̈"),
  皆: (s) => (s.is合口 ? "wạ̈i" : "ạ̈i"),
  夬: (s) => (s.is合口 ? "wại" : "ại"),
  刪: (s) => (s.is合口 ? "wạn" : "ạn"),
  山: (s) => (s.is合口 ? "wạ̈n" : "ạ̈n"),
  肴: "ạu",
  麻: (s) => {
    if (s.contrastiveRow等 === "三") return "yạ";
    return s.is合口 ? "wạ" : "ạ";
  },
  庚: (s) => {
    if (s.contrastiveRow等 === "三") return s.is合口 ? "wẹng" : "ẹng";
    return s.is合口 ? "wạng" : "ạng";
  },
  耕: (s) => (s.is合口 ? "wạ̈ng" : "ạ̈ng"),
  咸: "ạ̈m",
  銜: "ạm",

  // 四等韻
  齊: (s) => (s.is合口 ? "wei" : "ei"),
  先: (s) => (s.is合口 ? "wen" : "en"),
  蕭: "eu",
  青: (s) => (s.is合口 ? "weng" : "eng"),
  添: "em",

  // 三等陰聲韻
  支: (s) => {
    if (
      s.is合口 &&
      !(
        initialGroups["見"].has(s.canonical母) ||
        initialGroups["影"].has(s.canonical母) ||
        s.canonical母 === "以"
      )
    )
      return "uï";
    if (s.is合口)
      return s.canonical母 === "以" ||
        (s.is重紐A類 &&
          (initialGroups["幫"].has(s.canonical母) ||
            initialGroups["見"].has(s.canonical母) ||
            initialGroups["影"].has(s.canonical母)))
        ? "ẁï"
        : "wï";
    return s.canonical母 === "以" ||
      (s.is重紐A類 &&
        (initialGroups["幫"].has(s.canonical母) ||
          initialGroups["見"].has(s.canonical母) ||
          initialGroups["影"].has(s.canonical母)))
      ? "yï"
      : "ï";
  },
  脂: (s) => {
    if (
      s.is合口 &&
      !(
        initialGroups["見"].has(s.canonical母) ||
        initialGroups["影"].has(s.canonical母) ||
        s.canonical母 === "以"
      )
    )
      return "uī";
    if (s.is合口)
      return s.canonical母 === "以" ||
        (s.is重紐A類 &&
          (initialGroups["幫"].has(s.canonical母) ||
            initialGroups["見"].has(s.canonical母) ||
            initialGroups["影"].has(s.canonical母)))
        ? "ẁī"
        : "wī";
    return s.canonical母 === "以" ||
      (s.is重紐A類 &&
        (initialGroups["幫"].has(s.canonical母) ||
          initialGroups["見"].has(s.canonical母) ||
          initialGroups["影"].has(s.canonical母)))
      ? "yī"
      : "ī";
  },
  之: "i",
  微: (s) => (s.is合口 ? "wî" : "î"),
  魚: "yo",
  虞: (s) =>
    initialGroups["幫"].has(s.canonical母) ||
    initialGroups["見"].has(s.canonical母) ||
    initialGroups["影"].has(s.canonical母) ||
    s.canonical母 === "來"
      ? "u"
      : "yu",
  祭: (s) => {
    if (s.is合口)
      return s.canonical母 === "以" ||
        (s.is重紐A類 &&
          (initialGroups["幫"].has(s.canonical母) ||
            initialGroups["見"].has(s.canonical母) ||
            initialGroups["影"].has(s.canonical母)))
        ? "ẁei"
        : "wėi";
    return s.canonical母 === "以" ||
      (s.is重紐A類 &&
        (initialGroups["幫"].has(s.canonical母) ||
          initialGroups["見"].has(s.canonical母) ||
          initialGroups["影"].has(s.canonical母)))
      ? "yei"
      : "ėi";
  },
  廢: "âi",
  宵: (s) =>
    s.canonical母 === "以" ||
    (s.is重紐A類 &&
      (initialGroups["幫"].has(s.canonical母) ||
        initialGroups["見"].has(s.canonical母) ||
        initialGroups["影"].has(s.canonical母)))
      ? "yeu"
      : "ėu",
  尤: (s) => (initialGroups["幫"].has(s.canonical母) ? "ū" : "iū"),
  幽: "iu",

  // 三等陽聲韻
  鍾: (s) => {
    return initialGroups["幫"].has(s.canonical母) ? "ông" : "ŷong";
  },
  眞: (s) => {
    if (s.is合口) {
      if (
        !(
          initialGroups["見"].has(s.canonical母) ||
          initialGroups["影"].has(s.canonical母) ||
          s.canonical母 === "以" ||
          s.canonical母 === "來"
        )
      )
        return "yūn";
      return s.canonical母 === "以" ||
        (s.is重紐A類 &&
          (initialGroups["幫"].has(s.canonical母) ||
            initialGroups["見"].has(s.canonical母) ||
            initialGroups["影"].has(s.canonical母)))
        ? "ẁīn"
        : "wīn";
    }
    return s.canonical母 === "以" ||
      (s.is重紐A類 &&
        (initialGroups["幫"].has(s.canonical母) ||
          initialGroups["見"].has(s.canonical母) ||
          initialGroups["影"].has(s.canonical母)))
      ? "yīn"
      : "īn";
  },
  臻: "ịn",
  文: "un",
  欣: "in",
  元: (s) => {
    if (initialGroups["幫"].has(s.canonical母)) return "ân";
    return s.is合口 ? "wên" : "ên";
  },
  仙: (s) => {
    if (s.is合口)
      return s.canonical母 === "以" ||
        (s.is重紐A類 &&
          (initialGroups["幫"].has(s.canonical母) ||
            initialGroups["見"].has(s.canonical母) ||
            initialGroups["影"].has(s.canonical母)))
        ? "ẁen"
        : "wėn";
    return s.canonical母 === "以" ||
      (s.is重紐A類 &&
        (initialGroups["幫"].has(s.canonical母) ||
          initialGroups["見"].has(s.canonical母) ||
          initialGroups["影"].has(s.canonical母)))
      ? "yen"
      : "ėn";
  },
  陽: (s) => {
    if (s.is合口)
      return s.canonical母 === "影" ||
        s.canonical母 === "以" ||
        s.canonical母 === "云"
        ? "wâng"
        : "ŷang";
    return initialGroups["幫"].has(s.canonical母) ||
      initialGroups["莊"].has(s.canonical母)
      ? "âng"
      : "yang";
  },
  清: (s) => {
    if (s.is合口)
      return s.canonical母 === "以" ||
        (s.is重紐A類 &&
          (initialGroups["幫"].has(s.canonical母) ||
            initialGroups["見"].has(s.canonical母) ||
            initialGroups["影"].has(s.canonical母)))
        ? "ẁeng"
        : "wėng";
    return s.canonical母 === "以" ||
      (s.is重紐A類 &&
        (initialGroups["幫"].has(s.canonical母) ||
          initialGroups["見"].has(s.canonical母) ||
          initialGroups["影"].has(s.canonical母)))
      ? "yeng"
      : "ėng";
  },
  蒸: (s) => {
    if (s.is合口) return s.canonical母 === "云" ? "wĭng" : "ŷŏng";
    return "yŏng";
  },
  侵: (s) =>
    s.canonical母 === "以" ||
    (s.is重紐A類 &&
      (initialGroups["幫"].has(s.canonical母) ||
        initialGroups["見"].has(s.canonical母) ||
        initialGroups["影"].has(s.canonical母)))
      ? "yim"
      : "im",
  鹽: (s) =>
    s.canonical母 === "以" ||
    (s.is重紐A類 &&
      (initialGroups["幫"].has(s.canonical母) ||
        initialGroups["見"].has(s.canonical母) ||
        initialGroups["影"].has(s.canonical母)))
      ? "yem"
      : "ėm",
  嚴: "êm",
  凡: "âm",
};

export interface TranscriptionOptions {
  ascii?: boolean;
  separator?: string;
}

export function transcribe(
  syllable: QysTranscriptionProfile,
  { ascii = false, separator = "" }: TranscriptionOptions = {}
) {
  const { canonical母, tone聲: 聲, qieyunCycleHead韻: 韻 } = syllable;
  const transcribe韻母 = rhymes[韻 as QieyunRhymeCycleHead];
  const 母 = canonical母;

  const 母組 = getInitialGroup(母);

  const 韻母 =
    typeof transcribe韻母 === "string"
      ? transcribe韻母
      : transcribe韻母!(syllable);

  let initialRealization: string;
  if (
    母組 === "莊" &&
    // 2rd row or having underdot 臻庚
    asciiFinals[韻母 as keyof typeof asciiFinals].startsWith("r")
  )
    initialRealization =
      initials[retroflexToDental[母 as keyof typeof retroflexToDental]];
  else if (
    母組 === "端" &&
    // 2nd or 3rd row
    /^r|^w?([viuy])|^w?ie/.test(asciiFinals[韻母 as keyof typeof asciiFinals])
  ) {
    initialRealization = initials[母] + "h";
  } else if (!separator && 母 === "以" && /^[yŷẁ]/.test(韻母))
    initialRealization = "";
  else initialRealization = initials[母];

  if (ascii) {
    const 聲調 = {
      上: "q",
      去: "h",
      平: "",
      入: "",
    }[聲];

    return (
      (asciiInitials[initialRealization as keyof typeof asciiInitials] ||
        initialRealization) +
      separator +
      changeRuShengCoda(
        聲 === "入",
        asciiFinals[韻母 as keyof typeof asciiFinals]
      ) +
      separator +
      聲調
    );
  }

  const 聲調 = {
    上: "ˬ",
    去: "ˎ",
    平: "",
    入: "",
  }[聲];

  return (
    initialRealization +
    separator +
    changeRuShengCoda(聲 === "入", 韻母) +
    separator +
    聲調
  );
}
export function transcribeSyllableProfile(
  syllableProfile: QysSyllableProfile,
  options?: TranscriptionOptions
) {
  return transcribe(
    {
      is合口: syllableProfile.kaihe === Kaihe.Closed,
      canonical母: syllableProfile.initial,
      tone聲: syllableProfile.tone,
      is重紐A類: syllableProfile.dengOrChongniu === "A",
      qieyunCycleHead韻: syllableProfile.cycleHead,
      contrastiveRow等: syllableProfile.dengOrChongniu,
    },
    options
  );
}

const retroflexToDental = {
  莊: "精",
  初: "清",
  崇: "從",
  生: "心",
  俟: "邪",
} as const;

const initials = {
  幫: "p",
  滂: "pʻ",
  並: "b",
  明: "m",
  端: "t",
  透: "tʻ",
  定: "d",
  泥: "n",
  來: "l",
  知: "t",
  徹: "tʻ",
  澄: "d",
  孃: "n",
  精: "ts",
  清: "tsʻ",
  從: "dz",
  心: "s",
  邪: "z",
  莊: "tṣ",
  初: "tṣʻ",
  崇: "dẓ",
  生: "ṣ",
  俟: "ẓ",
  章: "tś",
  昌: "tśʻ",
  常: "dź",
  日: "nź",
  書: "ś",
  船: "ź",
  以: "y",
  見: "k",
  溪: "kʻ",
  羣: "g",
  疑: "ng",
  影: "ʾ",
  曉: "kh",
  匣: "gh",
  云: "",
};
const asciiInitials = {
  tʻ: "tx",
  kʻ: "kx",
  tṣʻ: "tsxr",
  pʻ: "px",
  ʾ: "q",
  ẓ: "zr",
  dẓ: "dzr",
  ṣ: "sr",
  tṣ: "tsr",
  ź: "zj",
  dź: "dzj",
  tś: "tsj",
  tśʻ: "tsxj",
  ś: "sj",
};

export type QieyunRhymeCycleHead =
  | "東"
  | "冬"
  | "模"
  | "泰"
  | "灰"
  | "咍"
  | "魂"
  | "痕"
  | "寒"
  | "豪"
  | "歌"
  | "唐"
  | "登"
  | "侯"
  | "覃"
  | "談"
  | "江"
  | "佳"
  | "皆"
  | "夬"
  | "刪"
  | "山"
  | "肴"
  | "麻"
  | "庚"
  | "耕"
  | "咸"
  | "銜"
  | "齊"
  | "先"
  | "蕭"
  | "青"
  | "添"
  | "支"
  | "脂"
  | "之"
  | "微"
  | "魚"
  | "虞"
  | "祭"
  | "廢"
  | "宵"
  | "尤"
  | "幽"
  | "鍾"
  | "眞"
  | "臻"
  | "文"
  | "欣"
  | "元"
  | "仙"
  | "陽"
  | "清"
  | "蒸"
  | "侵"
  | "鹽"
  | "嚴"
  | "凡";
