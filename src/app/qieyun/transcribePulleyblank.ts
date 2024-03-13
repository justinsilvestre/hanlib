import { QieyunRhymeCycleHead } from "./QieyunRhymeCycleHead";
import { QysInitial, getInitialGroup } from "./QysInitial";
import { DengOrChongniu, Kaihe, Tone } from "./QysSyllableProfile";
import { QysTranscriptionProfile } from "./QysTranscriptionProfile";

type UnionKeys<T> = T extends T ? keyof T : never;
type StrictUnionHelper<T, TAll> = T extends T
  ? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, undefined>>
  : never;
type StrictUnion<T> = StrictUnionHelper<T, T>;

// 歌 I||open ::
//   emc: a [ɑ]
//   lmc: a [ɑ], Pua [ɑ]
// 戈 I||closed ::
//   emc: wa [wɑ]
//   lmc: ua [uɑ]
// 戈 III-mixed||open ::
//   emc: ɨa [ɨɑ]
//   lmc: ia [iɑ]
// 戈 III-mixed||closed ::
//   emc: ua [uɑ]
//   lmc: ya [yɑ]
// 麻 II||open ::
//   emc: aɨ (ɛɨ)
//   lmc: aː [ɑː], Gjaː [Gjɑː]
// 麻 II||closed ::
//   emc: waɨ (wɛɨ)
//   lmc: waː [wɑː]
// 麻 III-mixed||open ::
//   emc: ia [iɑ]
//   lmc: ia [iɑ]
// 模 I||closed ::
//   emc: ɔ
//   lmc: uə̆ [uɔ]
// 魚 III-mixed||closed ::
//   emc: ɨə̆
//   lmc: iə̆ [iɛ], SRəə̆ [SRɤ] (yə̆ [yɛ], SRuə̆ [SRuɔ])
// 虞 III-mixed||closed ::
//   emc: uə̆
//   lmc: yə̆ [yɛ], SRuə̆ [SRuɔ]
// 咍 I||open ::
//   emc: əj
//   lmc: aj
// 灰 I||closed ::
//   emc: wəj
//   lmc: uaj
// 泰 I||open ::
//   emc: aj
//   lmc: aj
// 泰 I||closed ::
//   emc: waj
//   lmc: uaj
// 皆 II||open ::
//   emc: əɨj
//   lmc: aːj, Gjaːj
// 皆 II||closed ::
//   emc: wəɨj
//   lmc: waːj
// 佳 II||open ::
//   emc: aɨj
//   lmc: aːj, Gjaːj
// 佳 II||closed ::
//   emc: waɨj
//   lmc: waːj
// 夬 II||open ::
//   emc: aɨj(s){{efn|name=only-tone-3|These finals occur only in tone 3 (the "departing tone").  This is because they come from [[Old Chinese]] finals in ''-ts'' > ''-js'', while the corresponding Old Chinese finals in ''-j'' lost the /j/.  As a result, they often appear in {{Harvtxt|Pulleyblank|1962 as e.g. ''{{IPA|aɨj(s)'' and in {{Harvtxt|Baxter|1992 as e.g. ''æjH'', where the ''s'' and ''H'' are the respective notations for tone 3.
//   lmc: aːj, Gjaːj
// 夬 II||closed ::
//   emc: waɨj(s){{efn|name=only-tone-3
//   lmc: waːj
// 祭 III/3||open ::
//   emc: iaj
//   lmc: iaj
// 祭 III/4||open ::
//   emc: jiaj
//   lmc: PGjiaj
// 祭 III/3||closed ::
//   emc: wiaj
//   lmc: yaj
// 祭 III/4||closed ::
//   emc: jwiaj
//   lmc: PGjyaj
// 廢 III-indep||open ::
//   emc: ɨaj
//   lmc: iaj
// 廢 III-indep||closed ::
//   emc: uaj
//   lmc: yaj
// 齊 IV||open ::
//   emc: ɛj
//   lmc: PGjiaj, Aiaj
// 齊 IV||closed ::
//   emc: wɛj
//   lmc: Gjyaj
// 支 III/3||open ::
//   emc: iə̆
//   lmc: i, SRṛ, STẓ
// 支 III/4||open ::
//   emc: jiə̆
//   lmc: PGji
// 支 III/3||closed ::
//   emc: wiə̆
//   lmc: yj, SRuj
// 支 III/4||closed ::
//   emc: jwiə̆
//   lmc: PGjyj
// 脂 III/3||open ::
//   emc: i
//   lmc: i, SRṛ, STẓ
// 脂 III/4||open ::
//   emc: ji
//   lmc: PGji
// 脂 III/3||closed ::
//   emc: wi
//   lmc: yj, SRuj
// 脂 III/4||closed ::
//   emc: jwi
//   lmc: PGjyj
// 之 III-mixed||open ::
//   emc: ɨ
//   lmc: i, SRṛ, STẓ
// 微 III-indep||open ::
//   emc: ɨj
//   lmc: i
// 微 III-indep||closed ::
//   emc: uj
//   lmc: yj
// 豪 I||open ::
//   emc: aw
//   lmc: (u)aw
// 肴 II||open ::
//   emc: aɨw
//   lmc: aːw, Gjaːw
// 宵 III/3||open ::
//   emc: iaw
//   lmc: iaw
// 宵 III/4||open ::
//   emc: jiaw
//   lmc: PGjiaw
// 蕭 IV||open ::
//   emc: ɛw
//   lmc: PGjiaw, Aiaw
// 侯 I||open ::
//   emc: əw
//   lmc: əw
// 尤 III-mixed||open ::
//   emc: uw
//   lmc: iw, SRəw, Məw
// 幽 III/4||open ::
//   emc: jiw
//   lmc: jiw
// 覃 I||open ::
//   emc: əm
//   lmc: am
// 談 I||open ::
//   emc: am
//   lmc: am
// 咸 II||open ::
//   emc: əɨm
//   lmc: aːm, Gjaːm
// 銜 II||open ::
//   emc: aɨm
//   lmc: aːm, Gjaːm
// 鹽 III/3||open ::
//   emc: iam
//   lmc: iam
// 鹽 III/4||open ::
//   emc: jiam
//   lmc: PGjiam
// 嚴 III-indep||open ::
//   emc: ɨam
//   lmc: iam
// 凡 III-indep||closed ::
//   emc: uam
//   lmc: iam
// 添 IV||open ::
//   emc: ɛm
//   lmc: PGjiam, Aiam
// 侵 III/3||open ::
//   emc: im
//   lmc: im, SRəm
// 侵 III/4||open ::
//   emc: jim
//   lmc: PGjim
// 寒 I||open ::
//   emc: an
//   lmc: an
// 桓 I||closed ::
//   emc: wan
//   lmc: uan
// 刪 II||open ::
//   emc: aɨn
//   lmc: aːn, Gjaːn
// 刪 II||closed ::
//   emc: waɨn
//   lmc: waːn
// 山 II||open ::
//   emc: əɨn
//   lmc: aːn, Gjaːn
// 山 II||closed ::
//   emc: wəɨn
//   lmc: waːn
// 仙 III/3||open ::
//   emc: ian
//   lmc: ian
// 仙 III/4||open ::
//   emc: jian
//   lmc: PGjian
// 仙 III/3||closed ::
//   emc: wian
//   lmc: yan
// 仙 III/4||closed ::
//   emc: jwian
//   lmc: PGjyan
// 元 III-indep||open ::
//   emc: ɨan
//   lmc: ian
// 元 III-indep||closed ::
//   emc: uan
//   lmc: yan
// 先 IV||open ::
//   emc: ɛn
//   lmc: PGjian, Aian
// 先 IV||closed ::
//   emc: wɛn
//   lmc: jyan
// 痕 I||open ::
//   emc: ən
//   lmc: ən
// 魂 I||closed ::
//   emc: wən
//   lmc: un
// 臻 III/3||open ::
//   emc: in
//   lmc: SRən
// 眞 III/3||open ::
//   emc: in
//   lmc: in, SRən
// 眞 III/4||open ::
//   emc: jin
//   lmc: PGjin
// 眞 III/3||closed ::
//   emc: win
//   lmc: yn
// 諄 III/3||closed ::
//   emc: win
//   lmc: yn
// 諄 III/4||closed ::
//   emc: jwin
//   lmc: PGjyn
// 欣(殷?) III-indep||open ::
//   emc: ɨn
//   lmc: in
// 文 III-indep||closed ::
//   emc: un
//   lmc: yn, yt, SRut
// 唐 I||open ::
//   emc: aŋ [ɑŋ]
//   lmc: aŋ [ɑŋ]
// 唐 I||closed ::
//   emc: waŋ [wɑŋ]
//   lmc: uaŋ [uɑŋ]
// 陽 III-mixed||open ::
//   emc: ɨaŋ [ɨɑŋ]
//   lmc: iaŋ [iɑŋ], SRaːŋ [SRɑːŋ]
// 陽 III-mixed||closed ::
//   emc: uaŋ [uɑŋ]
//   lmc: yaŋ [yɑŋ]
// 江 II||open ::
//   emc: aɨwŋ
//   lmc: aːwŋ, RXLʔwaːwŋ, Gjaːwŋ
// 登 I||open ::
//   emc: əŋ
//   lmc: əə̆ŋ [ɤŋ]
// 登 I||closed ::
//   emc: wəŋ
//   lmc: uə̆ŋ [uɔŋ]
// 蒸 III-mixed||open ::
//   emc: iŋ
//   lmc: iə̆ŋ [iɛŋ], iə̆k [iɛk], SRəə̆k [SRɤk]
// 蒸 III-mixed||closed ::
//   emc: wiŋ
//   lmc: yə̆ŋ [yɛŋ]
// 庚 II||open ::
//   emc: aɨjŋ
//   lmc: aːjŋ, Gjaːjŋ
// 庚 II||closed ::
//   emc: waɨjŋ
//   lmc: waːjŋ
// 耕 II||open ::
//   emc: əɨjŋ
//   lmc: aːjŋ, Gjaːjŋ
// 耕 II||closed ::
//   emc: wəɨjŋ
//   lmc: waːjŋ
// 庚 III/3||open ::
//   emc: iajŋ
//   lmc: iajŋ
// 庚 III/3||closed ::
//   emc: wiajŋ
//   lmc: yajŋ
// 清 III/3||open ::
//   emc: iajŋ
//   lmc: iajŋ
// 清 III/4||open ::
//   emc: jiajŋ
//   lmc: PGjiajŋ
// 清 III/3||closed ::
//   emc: wiajŋ
//   lmc: yajŋ
// 清 III/4||closed ::
//   emc: jwiajŋ
//   lmc: jyajŋ
// 青 IV||open ::
//   emc: ɛjŋ
//   lmc: PGjiajŋ, Aiajŋ
// 青 IV||closed ::
//   emc: Kwɛjŋ
//   lmc: jyajŋ
// 東 I||closed ::
//   emc: əwŋ
//   lmc: əwŋ
// 冬 I||closed ::
//   emc: awŋ
//   lmc: əwŋ
// 東 III-mixed||closed ::
//   emc: uwŋ
//   lmc: iwŋ, SRəwŋ, Məwŋ
// 鍾 III-mixed||closed ::
//   emc: uawŋ
//   lmc: ywŋ

type Realization = string | ((profile: QysTranscriptionProfile) => string);
type MCFinals = [emc: Realization, lmc: Realization];

const guttural =
  (ifGuttural: string, alternate: string) =>
  (profile: QysTranscriptionProfile) => {
    const initialGroup = getInitialGroup(profile.canonical母);
    return initialGroup === "見" || initialGroup === "影"
      ? ifGuttural
      : alternate;
  };
const labial =
  (ifLabial: string, alternate: string) =>
  (profile: QysTranscriptionProfile) => {
    const initialGroup = getInitialGroup(profile.canonical母);
    return initialGroup === "幫" ? ifLabial : alternate;
  };
const retroflexSibilant =
  (ifRetroflexSibilant: string, alternate: string) =>
  (profile: QysTranscriptionProfile) => {
    const initialGroup = getInitialGroup(profile.canonical母);
    return initialGroup === "莊" || initialGroup === "章"
      ? ifRetroflexSibilant
      : alternate;
  };
// labial or guttural
const grave =
  (ifGrave: string, alternate: string) =>
  (profile: QysTranscriptionProfile) => {
    const initialGroup = getInitialGroup(profile.canonical母);
    return initialGroup === "幫" || initialGroup === "見" ? ifGrave : alternate;
  };

const retroflexOrAlveolarSibiliantOr =
  (
    ifRetroflexSibilant: string,
    ifAlveolarSibilant: string,
    alternate: string
  ) =>
  (profile: QysTranscriptionProfile) => {
    const initialGroup = getInitialGroup(profile.canonical母);
    if (initialGroup === "莊" || initialGroup === "章")
      return ifRetroflexSibilant;
    if (initialGroup === "精") return ifAlveolarSibilant;
    return alternate;
  };

const jiang =
  (
    ifGuttural: string,
    ifRetroflexPalatalSibilantLOrGlottalStop: string,
    alternate: string
  ) =>
  (profile: QysTranscriptionProfile) => {
    const initialGroup = getInitialGroup(profile.canonical母);
    if (initialGroup === "見" || initialGroup === "影") return ifGuttural;
    return initialGroup === "章" ||
      initialGroup === "知" ||
      profile.canonical母 === "來" ||
      profile.canonical母 === "影"
      ? ifRetroflexPalatalSibilantLOrGlottalStop
      : alternate;
  };

const finals: Record<
  QieyunRhymeCycleHead,
  | MCFinals
  | StrictUnion<
      | { [K in DengOrChongniu]?: MCFinals | { [K in Kaihe]?: MCFinals } }
      | { [K in Kaihe]?: MCFinals }
    >
> = {
  歌: {
    一: {
      開: ["ɑ", labial("uɑ", "ɑ")],
      合: ["wɑ", "uɑ"],
    },
    二: {
      開: ["ɨɑ", "iɑ"],
      合: ["uɑ", "yɑ"],
    },
  },
  麻: {
    二: {
      開: ["aɨ", guttural("jaː", "ɑː")],
      合: ["waɨ", "wɑː"],
    },
    三: {
      開: ["iɑ", "iɑ"],
      合: ["iɑ", "yɑ"],
    },
  },
  模: ["ɔ", "uɔ"],
  //   emc: ɨə̆
  //   lmc: iə̆ [iɛ], SRəə̆ [SRɤ] (yə̆ [yɛ], SRuə̆ [SRuɔ])
  魚: ["ɨə̆", "yɛ"],
  // emc: uə̆
  // lmc: yə̆ [yɛ], SRuə̆ [SRuɔ]
  虞: ["uə̆", retroflexSibilant("uɔ", "yɛ")],
  咍: ["əj", "aj"],
  灰: ["wəj", "uaj"],
  泰: {
    開: ["aj", "aj"],
    合: ["waj", "uaj"],
  },
  皆: {
    開: ["əɨj", guttural("jaːj", "aːj")],
    合: ["wəɨj", "waːj"],
  },
  佳: {
    開: ["aɨj", guttural("jaːj", "aːj")],
    合: ["waɨj", "waːj"],
  },
  夬: {
    開: ["aɨj", guttural("jaːj", "aːj")],
    合: ["waɨj", "waːj"],
  },
  祭: {
    三: {
      開: ["iaj", "iaj"],
      合: ["wiaj", "yaj"],
    },
    四: {
      開: ["jiaj", grave("jiaj", "iaj")],
      合: ["jwiaj", grave("jyaj", "yaj")],
    },
  },
  廢: {
    開: ["ɨaj", "iaj"],
    合: ["uaj", "yaj"],
  },
  齊: {
    開: ["ɛj", grave("jiaj", "iaj")],
    合: ["wɛj", grave("jyaj", "yaj")],
  },
  支: {
    三: {
      開: ["iə̆", retroflexOrAlveolarSibiliantOr("ṛ", "ẓ", "i")],
      合: ["wiə̆", retroflexSibilant("uj", "yj")],
    },
    四: {
      開: ["jiə̆", grave("ji", "i")],
      合: ["jwiə̆", grave("jyj", "yj")],
    },
  },
  脂: {
    三: {
      開: ["i", retroflexOrAlveolarSibiliantOr("ṛ", "ẓ", "i")],
      合: ["wi", retroflexSibilant("uj", "yj")],
    },
    四: {
      開: ["ji", grave("ji", "i")],
      合: ["jwi", grave("jyj", "yj")],
    },
  },
  之: ["ɨ", retroflexOrAlveolarSibiliantOr("ṛ", "ẓ", "i")],
  微: {
    開: ["ɨj", "i"],
    合: ["uj", "yj"],
  },
  豪: ["aw", "aw"], // (u)aw
  肴: ["aɨw", guttural("jaːw", "aːw")],
  宵: {
    三: ["iaw", "iaw"],
    四: ["jiaw", grave("jiaw", "iaw")],
  },
  蕭: ["ɛw", grave("jiaw", "iaw")],
  侯: ["əw", "əw"],
  尤: [
    "uw",
    (profile) =>
      profile.canonical母 === "明" ||
      getInitialGroup(profile.canonical母) === "莊" ||
      getInitialGroup(profile.canonical母) === "章"
        ? "əw"
        : "iw",
  ],
  幽: ["jiw", "jiw"],
  覃: ["əm", "am"],
  談: ["am", "am"],
  咸: ["əɨm", guttural("jaːm", "aːm")],
  銜: ["aɨm", guttural("jaːm", "aːm")],
  鹽: {
    三: ["iam", "iam"],
    四: ["jiam", grave("jiam", "iam")],
  },
  嚴: ["ɨam", "iam"],
  凡: ["uam", "iam"],
  添: ["ɛm", grave("jiam", "iam")],
  侵: {
    三: ["im", retroflexSibilant("əm", "im")],
    四: ["jim", grave("jim", "im")],
  },
  寒: {
    開: ["an", "an"],
    合: ["wan", "uan"],
  },
  刪: {
    開: ["aɨn", guttural("jaːn", "aːn")],
    合: ["waɨn", "waːn"],
  },
  山: {
    開: ["əɨn", guttural("jaːn", "aːn")],
    合: ["wəɨn", "waːn"],
  },
  仙: {
    三: {
      開: ["ian", "ian"],
      合: ["wian", "yan"],
    },
    四: {
      開: ["jian", grave("jian", "ian")],
      合: ["jwian", grave("jyan", "yan")],
    },
  },
  元: {
    開: ["ɨan", "ian"],
    合: ["uan", "yan"],
  },
  先: {
    開: ["ɛn", grave("jian", "ian")],
    合: ["wɛn", "jyan"],
  },
  痕: ["ən", "ən"],
  魂: ["wən", "un"],
  臻: ["in", "ən"],
  眞: {
    三: {
      開: ["in", retroflexSibilant("ən", "in")],
      合: ["win", "yn"],
    },
    四: {
      開: ["jin", grave("jin", "in")],
      合: ["jwin", grave("jyn", "yn")],
    },
  },
  欣: ["ɨn", "in"],
  文: ["un", retroflexSibilant("un", "yn")],
  唐: {
    開: ["ɑŋ", "ɑŋ"],
    合: ["wɑŋ", "uɑŋ"],
  },
  陽: {
    開: ["ɨɑŋ", retroflexSibilant("ɑːŋ", "iɑŋ")],
    合: ["uɑŋ", "yɑŋ"],
  },
  江: ["aɨwŋ", jiang("jaːwŋ", "waːwŋ", "aːwŋ")],
  登: {
    開: ["əŋ", "ɤŋ"],
    合: ["wəŋ", "uɔŋ"],
  },
  蒸: {
    三: ["iŋ", retroflexSibilant("ɤŋ", "iɛŋ")],
    四: ["wiŋ", "yɛŋ"],
  },
  庚: {
    二: {
      開: ["aɨjŋ", guttural("jaːjŋ", "aːjŋ")],
      合: ["waɨjŋ", "waːjŋ"],
    },
    三: {
      開: ["iajŋ", "iajŋ"],
      合: ["wiajŋ", "yajŋ"],
    },
  },
  耕: {
    開: ["əɨjŋ", guttural("jaːjŋ", "aːjŋ")],
    合: ["wəɨjŋ", "waːjŋ"],
  },
  清: {
    三: {
      開: ["iajŋ", "iajŋ"],
      合: ["wiajŋ", "yajŋ"],
    },
    四: {
      開: ["jiajŋ", grave("jiajŋ", "iajŋ")],
      合: ["jwiajŋ", "jyajŋ"],
    },
  },
  青: {
    開: ["ɛjŋ", grave("jiajŋ", "iajŋ")],
    合: ["wɛjŋ", "jyajŋ"],
  },
  東: ["əwŋ", "əwŋ"],
  冬: ["awŋ", "əwŋ"],
  鍾: ["uwŋ", "iwŋ"],
};

const 崇Series = (profile: QysTranscriptionProfile) =>
  profile.tone聲 === "平" ? "tʂɦ" : "ʂɦ";
export const noMDentilabializationFinals = new Set<QieyunRhymeCycleHead>([
  "尤",
  "東",
]);
export const alwaysDentilabializationFinals = new Set<QieyunRhymeCycleHead>([
  "元",
  "陽",
  "凡",
  "廢",
  "虞",
  "微",
  "文",
  "鍾",
]);
const dentilabial =
  (ifDentilabial: string, alternate: string) =>
  (profile: QysTranscriptionProfile) => {
    const initialGroup = getInitialGroup(profile.canonical母);
    if (initialGroup === "幫") {
      const isDentilabialTriggerFinal =
        (profile.qieyunCycleHead韻 === "東" && profile.row等 == "三") ||
        alwaysDentilabializationFinals.has(profile.qieyunCycleHead韻) ||
        (noMDentilabializationFinals.has(profile.qieyunCycleHead韻) &&
          profile.canonical母 !== "明");
      return isDentilabialTriggerFinal ? ifDentilabial : alternate;
    }
    return alternate;
  };

const initials: Record<QysInitial, [emc: Realization, lmc: Realization]> = {
  幫: ["p", dentilabial("f", "p")],
  滂: ["pʰ", dentilabial("f", "pʰ")],
  並: ["b", dentilabial("fɦ", "b")],
  明: ["m", dentilabial("ʋ", "m")],
  端: ["t", "t"],
  透: ["tʰ", "tʰ"],
  定: ["d", "tɦ"],
  泥: ["n", "n"],
  知: ["ʈ", "ʈ"],
  徹: ["ʈʰ", "ʈʰ"],
  澄: ["ɖ", "ʈɦ"],
  孃: ["ɳ", "n"],
  精: ["ts", "ts"],
  清: ["tsʰ", "tsʰ"],
  從: ["dz", "tsɦ"],
  心: ["s", "s"],
  邪: ["z", "z"],
  莊: ["tʂ", "tʂ"],
  初: ["tʂʰ", "tʂʰ"],
  崇: ["dʐ", 崇Series],
  生: ["ʂ", "ʂ"],
  俟: ["ʐ", 崇Series],
  章: ["tɕ", "tʂ"],
  昌: ["tɕʰ", "tʂʰ"],
  常: ["dʑ", 崇Series],
  書: ["ɕ", "ʂ"],
  船: ["ʑ", "ʂɦ"],
  見: ["k", "k"],
  溪: ["kʰ", "kʰ"],
  羣: ["ɡ", "kɦ"],
  疑: ["ŋ", "ŋ"],
  影: ["ʔ", "ʔ"],
  曉: ["x", "x"],
  匣: ["ɣ", "xɦ"],
  云: [(profile) => (profile.qieyunCycleHead韻 === "之" ? "" : "w"), ""], // check
  以: ["j", "j"],
  來: ["l", "l"],
  日: ["ɲ", "ɻ"],
};

export function transcribe(
  profile: QysTranscriptionProfile,
  { period }: { period: "emc" | "lmc" }
): string {
  if (period === "emc") {
    const initial = initials[profile.canonical母];
    const initialRealization =
      typeof initial[0] === "string" ? initial[0] : initial[0](profile);
    const final = realizeFinal(profile);
    const finalRealization = realizeTone(
      typeof final[0] === "string" ? final[0] : final[0](profile),
      profile,
      period
    );
    return finalRealization.startsWith("w") &&
      initialRealization.startsWith("w")
      ? finalRealization
      : `${initialRealization}${finalRealization}`;
  }
  const initial = initials[profile.canonical母];
  const initialRealization =
    typeof initial[1] === "string" ? initial[1] : initial[1](profile);
  const final = realizeFinal(profile);
  const finalRealization =
    typeof final[1] === "string" ? final[1] : final[1](profile);
  return `${initialRealization}${realizeTone(
    finalRealization,
    profile,
    period
  )}`;
}

function realizeTone(
  final: string,
  profile: QysTranscriptionProfile,
  period: "emc" | "lmc"
) {
  if (profile.tone聲 === "入")
    return final.replace(/([mnŋ])$/, (_, mnng) => {
      if (mnng === "n") return "t";
      if (mnng === "ŋ") return "k";
      return "p";
    });
  if (period === "emc") {
    if (profile.tone聲 === "上") return final + "ʼ";
    if (profile.tone聲 === "去") return final + "ʰ";

    return final;
  }

  if (profile.tone聲 === "上") return final + "´";
  if (profile.tone聲 === "去") return final + "`";
  return final;
}

function realizeFinal(profile: QysTranscriptionProfile): MCFinals {
  const finalCandidates = finals[profile.qieyunCycleHead韻];
  if (Array.isArray(finalCandidates)) return finalCandidates;
  if ("開" in finalCandidates)
    return finalCandidates[profile.is合口 ? "合" : "開"]!;
  if (
    "三" in finalCandidates &&
    (profile.row等 === "三" || profile.row等 === "B")
  ) {
    const byThirdRow = finalCandidates["三"]!;
    if ("開" in byThirdRow) return byThirdRow[profile.is合口 ? "合" : "開"]!;
    return byThirdRow as MCFinals;
  }
  if (
    "四" in finalCandidates &&
    (profile.row等 === "四" || profile.row等 === "A")
  ) {
    const byFourthRow = finalCandidates["四"]!;
    if ("開" in byFourthRow) return byFourthRow[profile.is合口 ? "合" : "開"]!;
    return byFourthRow as MCFinals;
  }
  if ("二" in finalCandidates && profile.row等 === "二") {
    const bySecondRow = finalCandidates["二"]!;
    if ("開" in bySecondRow) return bySecondRow[profile.is合口 ? "合" : "開"]!;
    return bySecondRow as MCFinals;
  }
  if ("一" in finalCandidates && profile.row等 === "一") {
    const byFirstRow = finalCandidates["一"]!;
    if ("開" in byFirstRow) return byFirstRow[profile.is合口 ? "合" : "開"]!;
    return byFirstRow as MCFinals;
  }

  throw new Error("No final found");
}
