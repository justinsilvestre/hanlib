// adapted from https://github.com/nk2028/qieyun-examples/blob/main/karlgren.js
// license: CC0 1.0 Universal https://github.com/nk2028/qieyun-examples/blob/main/LICENSE

import { QysInitial, getInitialGroup } from "./QysInitial";
import { QysTranscriptionProfile } from "./QysTranscriptionProfile";
/* 潘悟雲擬音
 *
 * 兩個版本：
 *
 * - 潘悟雲. 漢語歷史音韻學. 上海: 上海教育出版社, 2000.
 * - 潘悟雲, 張洪明. 漢語中古音. 語言研究, 2013, 33 (2): 1–7.
 *
 * @author unt
 */

type Options = {
  版本?: "2000" | "2013";
  非前三等介音: "i" | "ɨ";
  聲調記號: string;
  送氣記號?: string[];
  支韻?: string[];
  虞韻?: string[];
};

export function transcribe(
  syllable: QysTranscriptionProfile,
  選項: Options = {
    版本: "2013",
    非前三等介音: "ɨ",
    聲調記號: "五度符號",
  }
) {
  const { canonical母, tone聲: 聲, qieyunCycleHead韻: 韻 } = syllable;
  const 母 = canonical母;

  const is2000 = 選項.版本 === "2000";

  const effectiveOptions: Options & Required<Pick<Options, "支韻" | "虞韻">> = {
    版本: "2013",
    送氣記號: ["ʰ"],
    支韻: is2000 ? ["iɛ", "iᵉ"] : ["iɛ"],
    虞韻: is2000 ? ["io", "iʊ"] : ["io"],
    ...選項,
  };

  const 聲母 = get聲母(母, is2000, effectiveOptions);
  const 韻母 = get韻母(syllable, 韻, is2000, effectiveOptions);
  const 聲調 = get聲調(聲, effectiveOptions);
  return 聲母 + 韻母 + 聲調;
}

function get聲母(母: QysInitial, is2000: boolean, 選項: Options) {
  let 聲母 = {
    幫: "p",
    滂: "pʰ",
    並: "b",
    明: "m",
    端: "t",
    透: "tʰ",
    定: "d",
    泥: "n",
    來: "l",
    知: "ʈ",
    徹: "ʈʰ",
    澄: "ɖ",
    孃: "ɳ",
    見: "k",
    溪: "kʰ",
    羣: "ɡ",
    疑: "ŋ",
    影: "ʔ",
    曉: "h",
    匣: "ɦ",
    云: "ɦ",
    精: "ts",
    清: "tsʰ",
    從: "dz",
    心: "s",
    邪: "z",
    莊: "tʂ",
    初: "tʂʰ",
    崇: "dʐ",
    生: "ʂ",
    俟: "ʐ",
    章: "tɕ",
    昌: "tɕʰ",
    常: "dʑ",
    書: "ɕ",
    船: "ʑ",
    日: "ȵ",
    以: "j",
    // 生母《漢語歷史音韻學》作“ʃ”，係誤植
    // 從母《漢語中古音》聲母表作“ʣ”，係排版錯誤，正文作“dz”
    // 俟母《漢語中古音》聲母表未列，此處補上
  }[母];
  if (is2000 && 選項.送氣記號) 聲母 = 聲母.replace("ʰ", 選項.送氣記號[0]);
  return 聲母;
}

function get韻母(
  profile: QysTranscriptionProfile,
  韻母: string,
  is2000: boolean,
  選項: Options & Required<Pick<Options, "支韻" | "虞韻">>
): string {
  const 韻 = profile.qieyunCycleHead韻;
  if (韻 === "凡")
    return get韻母(
      {
        ...profile,
        qieyunCycleHead韻: "嚴",
      },
      韻母,
      is2000,
      選項
    );
  const 元音表 = {
    ɪ: "　　　臻　　",
    i: "脂　侵眞　幽",
    ɨ: "之蒸　欣微尤",
    u: "侯東　文　　",
    e: "　青添先齊蕭",
    ə: "　登覃痕咍　",
    o: "模冬　魂灰　",
    ᴇ: "支清鹽仙祭宵",
    ɤ: "魚　　元　　",
    ʊ: "虞鍾　　　　",
    ɛ: "佳耕咸山皆　",
    a: "　陽嚴　廢　",
    ɔ: "　江　　　　",
    æ: "麻庚銜刪夬肴",
    ɑ: "歌唐談寒泰豪",
  };
  const 韻尾列表 = [""].concat(
    profile.tone聲 !== "入" ? [..."ŋmniu"] : [..."kpt"]
  );
  let 韻核 = Object.entries(元音表).find(([k, v]) => v.includes(韻母))?.[0]!;
  let 韻尾 = 韻尾列表[元音表[韻核 as keyof typeof 元音表].indexOf(韻母)] || "";
  let 介音 = "";
  if (
    profile.is合口 &&
    ![..."mpu"].includes(韻尾) &&
    ![..."uoʊɔ"].includes(韻核)
  )
    介音 += "ʷ";
  const initialGroup = getInitialGroup(profile.canonical母);
  if (
    initialGroup === "幫" &&
    ![..."ŋkmpu"].includes(韻尾) &&
    [..."ɨəɤaɑ"].includes(韻核) &&
    profile.qieyunCycleHead韻 !== "泰"
  )
    介音 += is2000 ? "ʷ" : "u̯";
  if (
    profile.row等 === "二" ||
    profile.qieyunCycleHead韻 === "庚" ||
    (profile.is重紐B類 &&
      !(
        profile.qieyunCycleHead韻 === "蒸" || profile.qieyunCycleHead韻 === "幽"
      ))
  )
    介音 += is2000 ? "ɯ" : "ɣ";
  if (profile.row等 === "三" && ![..."ɪiɨ"].includes(韻核))
    介音 += [..."ᴇæ"].includes(韻核) ? "i" : 選項.非前三等介音;
  if ([..."oʊ"].includes(韻核)) 介音 += is2000 ? (介音 ? "" : "u") : "u̯";
  // 調整韻核
  if (is2000) {
    const 韻核鏈移列表 = [..."ᴇɛæaɐ"]; // “鏈移”只是比喻
    if (韻核鏈移列表.includes(韻核))
      韻核 = 韻核鏈移列表[韻核鏈移列表.indexOf(韻核) + 1];
    韻核 =
      (
        {
          尤: "i",
          幽: "ɨ",
          侯: "əu",
          支: 選項.支韻[1],
          魚: "ɔ",
          虞: 選項.虞韻[1],
          元: "ɐ",
          鍾: "o",
        } as { [key: string]: string }
      )[韻] ?? 韻核;
  } else {
    韻核 = 韻核.replace("ʊ", "o̝");
  }
  return 介音 + 韻核 + 韻尾;
}

function get聲調(聲: "平" | "上" | "去" | "入", 選項: Options) {
  return 選項.聲調記號 === "隱藏"
    ? ""
    : (
        {
          五度符號: ["˧", "˧˥", "˥˩", "꜊"],
          調值數字: ["³³", "³⁵", "⁵¹", "³"],
        } as {
          [key: string]: string[];
        }
      )[選項.聲調記號.slice(0, 4)]["平上去入".indexOf(聲)];
}
