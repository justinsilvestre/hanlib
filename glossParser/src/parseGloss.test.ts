import { test, expect } from "vitest";
import { GlossDocument, GlossElement } from "../src/glossUtils";
import parseGloss from "./parseGloss";

generatesTranslation({
  glossText: `[^at a] 人 person / 之 ~'s / 初 beginning.`,
  expectedTranslation: `At a person's beginning.`,
  // debug: true,
});
generatesTranslation({
  glossText: `苟 ^supposing / [one is] 不 not / 教 teach[:taught] .`,
  expectedTranslation: `Supposing one is not taught.`,
});
generatesTranslation({
  glossText: `[^one's] 性 nature / [will] 乃 accordingly / 遷 shift .`,
  expectedTranslation: `One's nature will accordingly shift.`,
});
generatesTranslation({
  glossText: `3教 teach[ing] / 2之 's (of) / 1[^the] 道 way \\n
2貴 valuable (dear) / [^is] 以 [to_]hold / 1專 dedicated[--ion].`,
  expectedTranslation: `The way of teaching
Is to hold dedication dear.`,
});

generatesTranslation({
  glossText:
    "2相 one_another / 1看 ^look[ing_at] , 兩不 both-do_not (neither) [of us] / 厭 tire[s]_of [it] .",
  expectedTranslation: "Looking at one another, neither of us tires of it.",
  debug: true,
});

// 長安道人無衣馬無草何不歸來山中老

generatesTranslation({
  glossText: `2[to] 長安 long-peace (Chang'an) / 1[^on the] 道 road,\\n
[^the] 人 people / 無 have_no / 衣 clothing \\n
[^and the] 馬 horse[s] / 無 have_no / 草 grass .\\n
何 [for_]what (^why) / 不 don't / 2[back] 歸 return_home[:home] / 1[you] 來 come  / 3[the] 山 mountain[s] / 2中 middle (in) / 1老 [to_]grow_old?`,
  expectedTranslation: `On the road to Chang'an,
The people have no clothing
And the horses have no grass.
Why don't you come back home to grow old in the mountains?`,
});

// 白日依山盡黃河入海流欲窮千里目更上一層樓

generatesTranslation({
  glossText: `[^the] 白 white / 日 sun / 2依 rest[ing]_on / 3[the] 山 mountain[s] / 1盡 deplete (go[es]_out) .\\n
[^the] 黃河 yellow-river (Yellow_River) / 2入 enter (into) / 3[the] 海 sea / 1流 flow[s] .\\n
[^if you] 欲 want / [to] 窮 push_to_the_limit[:push] / 千里 thousand-li (thousand\\-mile) / 目 eye[s] [to their limit] ,\\n
2更 more / 上 ^go_up / 1一 one / 層 layer (flight) / [of the] 樓 tower.`,
  expectedTranslation: `The white sun goes out resting on the mountains.
The Yellow River flows into the sea.
If you want to push thousand-mile eyes to their limit,
Go up one more flight of the tower.`,
});

// 不知明鏡裏何處得秋霜

generatesTranslation({
  comment: "rearranging words from separate lines",
  glossText: `[I] 不 do_not / 知 know / 3[of my] 明 bright / 4鏡 mirror / 2[the] 裏 inside /
1何處 what-place (where) \\n 得 ^acquire[d] / [its] 秋 autumn / 霜 frost.`,
  expectedTranslation: `I do not know where the inside of my bright mirror
Acquired its autumn frost.`,
});

// 眾 鳥 高 飛 盡
// 孤 雲 獨 去 閒
// 相 看 兩 不 厭
// 只 有 敬 亭 山

generatesTranslation({
  comment: "spaces",
  glossText: `[^the] 眾 mass[es] / [of] 鳥 birds / 2[in the] 高 high[:heights] / 飛 fly / 1盡 vanish (away) .\\n
[^a] 孤 lonely / 雲 cloud / 2[in] 獨 solitary[---ude] / 去 depart[s] / 1閒 tranquil[ly] .\\n
2相 one_another / 1看 ^look[ing_at], 兩不 both-do_not (neither) [of us] / 厭 tire[s]_of [it] .\\n
2只 only / 1有 ^there_is / 敬亭山 venerate-pavilion-mountain (Venerated_Pavilion_Mountain).`,
  expectedTranslation: `The masses of birds fly away in the heights.
A lonely cloud departs tranquilly in solitude.
Looking at one another, neither of us tires of it.
There is only Venerated Pavilion Mountain.`,
});

// 松 下 問 童 子
// 言 師 採 藥 去
// 只 在 此 山 中
// 雲 深 不 知 處

generatesTranslation({
  comment: "punctuation",
  glossText: `2[the] 松 pine[s] / 1下 ^below , [I] 問 ask[ed] / [the] 童子 juvenile-child (boy) .\\n
[^he] 言 say[-id] ,_"~ [My] 師 teacher / 2[to] 採 pick / 3藥 medicine / 1去 depart (go[:went]) .\\n
只 ^only , [he] 在 is / 2此 this (these) / 3山 mountain[s] / 1中 amid .\\n
[^the] 雲 cloud[s] / 深 [are_]deep ; [I] 不 do_not[:don't] / 知 know / 處 place (where)."`,
  // 只 ^only, [he] 在 is / 2此 this (these) - 山 mountain[s] / 1中 amid.
  expectedTranslation: `Below the pines, I asked the boy.
He said, "My teacher went to pick medicine.
Only, he is amid these mountains.
The clouds are deep; I don't know where."`,
});

// 偶 來 松 樹 下

generatesTranslation({
  comment: "Padding placement",
  glossText:
    "偶 ^by_chance / [I've] 來 come [right here] / 2[the] 松 pine / 3樹 tree[s] / 1下 beneath.",
  expectedTranslation: "By chance I've come right here beneath the pine trees.",
});

generatesTranslation({
  comment: "Padding placement 2",
  glossText:
    // "2[with] 相 each_other (one_another) / 1留 ^stay[ing] / [and] 畏 dread[ing] / [the] 曉 dawn / 鐘 bell.",
    "2[with] 相 each_other (one_another) / 1留 ^stay[ing] / [and] 畏 dread[ing] / [the] 曉 dawn / 鐘 bell.",
  expectedTranslation: "Staying with one another and dreading the dawn bell.",
});

// 翻 疑 夢 裡 逢

generatesTranslation({
  glossText:
    "2翻 on_the_contrary (actually) / 1[I] 疑 doubt (wonder) [~\\,] , 3[a] 夢 dream / 2裡 inside (in) / 1[am I] 逢 encounter (meet[ing]) [you] ?",
  // "2翻 on_the_contrary (actually) / 1[I] 疑 doubt (wonder) , 3[a] 夢 dream / 2裡 inside (in) / 1[am I] 逢 encounter (meet[ing]) [you]?",
  expectedTranslation: "I wonder, actually, am I meeting you in a dream?",
});

// 淚溼薜蘿衣
generatesTranslation({
  glossText:
    "淚 ^tears / 溼 moist[en] / 2[of] 薜蘿 vine-moss (vine) / 1[my] 衣 robe.",
  expectedTranslation: "Tears moisten my robe of vine.",
});

generatesTranslation({
  glossText: `有 be[:^there_were] / [some] 鴉 crow[s] / [who] 集 flock[ed]_together / [in a] 庭 courtyard / [upon a] 樹 tree / 2引 stretch / 4頸 [their_]neck[s] / 3而 and[:~ing] / 1[and] 鳴 sing (caw[ed]).`,
  expectedTranslation: `There were some crows who flocked together in a courtyard upon a tree and cawed stretching their necks.`,
});

generatesTranslation({
  glossText: `[His] 父 father / 曰。 speak[:asked] ,_"~ 2[in] 是 this / 何 ^what / 1[is the] 害。 harm ?"`,
  expectedTranslation: `His father asked, "What is the harm in this?"`,
});

generatesTranslation({
  glossText: `今 now[:^today] / 4鳴 [are_]sing[ing] / 3者 that_which[:that] / 2[the] 鴉 crow[s] / 1也 final_particle[:it_is], 故 therefore / [I] 叱 [have_]hoot[ed]_at / 之 them."`,
  expectedTranslation: `Today it is the crows that are singing, therefore I have hooted at them."`,
});

generatesTranslation({
  glossText: `尚 still[:^yet] [he] / 2不 not[:~not] / 1能 be_able[:can] / 預知 beforehand-know (foresee) / 吉 auspicious[:good_luck] [and] / 凶 unlucky[:ill_luck].`,
  expectedTranslation: `Yet he cannot foresee good luck and ill luck.`,
});

generatesTranslation({
  glossText: `而況 and-still_more (^still_more) / [the] 鳥 bird[s] / [are not able to do it] 乎 exclamatory_particle[:~\\!]`,
  expectedTranslation: `Still more the birds are not able to do it!`,
  // debug: true,
});

function generatesTranslation({
  comment,
  glossText,
  expectedTranslation,
  debug = false,
  only = false,
}: {
  comment?: string;
  glossText: string;
  expectedTranslation: string;
  debug?: boolean;
  only?: boolean;
}) {
  (only ? test.only : test)(`Parses \`${comment || glossText}\``, () => {
    const parsed = parseGloss(glossText);
    expect(parsed.error).toEqual(undefined);
    if (!parsed.ok) return undefined;
    try {
      if (debug) {
        console.log("debug!!");
        for (const tel of parsed.translation) {
          console.dir("segment", tel);
        }
      }
      expect(renderTranslation(parsed)).toEqual(expectedTranslation);
    } catch (err) {
      console.error(err);
      console.error("Malformed translation " + glossText);
      console.dir(parsed.translation);
      throw err;
    }
  });
}

function renderTranslation(parsed: {
  ok: true;
  ast: GlossDocument;
  translation: GlossElement[];
  error?: undefined;
}) {
  return parsed.ast.renderTranslation().text;
}
