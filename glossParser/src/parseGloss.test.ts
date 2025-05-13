import { test, expect } from "vitest";
import { GlossDocument, GlossElement } from "./glossUtils";
import parseGloss from "./parseGloss";

generatesTranslation({
  glossText: `[^at a] person ~'s beginning.`,
  expectedTranslation: `At a person's beginning.`,
});
generatesTranslation({
  glossText: `^supposing [one_is] not teach[:taught].`,
  expectedTranslation: `Supposing one is not taught.`,
});
generatesTranslation({
  glossText: `[^one's] nature [will] accordingly shift.`,
  expectedTranslation: `One's nature will accordingly shift.`,
});
generatesTranslation({
  glossText: `[^the] 3teach[ing] 2's (of) 1way
[^is] 2valuable (dear) [to_]hold 1dedicated[--ion].`,
  expectedTranslation: `The way of teaching
Is to hold dedication dear.`,
});

generatesTranslation({
  glossText:
    "2one_another 1^look[ing_at], both-do_not (neither) [of us] tire[s]_of [it].",
  expectedTranslation: "Looking at one another, neither of us tires of it.",
});

generatesTranslation({
  glossText: `2[to] long-peace (Chang'an) 1[^on the] road,
[^the] people have_no clothing
[^and the] horse[s] have_no grass.
[for_]what (^why) don't 2[back] return_home[:home] 1[you] come 3[the] mountain[s] 2middle (in) 1[to_]grow_old?`,
  expectedTranslation: `On the road to Chang'an,
The people have no clothing
And the horses have no grass.
Why don't you come back home to grow old in the mountains?`,
});

generatesTranslation({
  glossText: `[^the] white sun 2rest[ing]_on [the] 3mountain[s] 1deplete (go[es]_out).
[^the] yellow-river (Yellow_River) 2enter (into) 3[the] sea 1flow[s].
[^if you] want [to] push_to_the_limit[:push] thousand-li (thousand\\-mile) eye[s] [to their limit],
2more ^go_up 1one layer (flight) [of the] tower.`,
  expectedTranslation: `The white sun goes out resting on the mountains.
The Yellow River flows into the sea.
If you want to push thousand-mile eyes to their limit,
Go up one more flight of the tower.`,
});

generatesTranslation({
  comment: "rearranging words from separate lines",
  glossText: `[I] do_not know 3[of my] bright 4mirror 2[the] inside
1what-place (^where) acquire[d] [its] autumn frost.`,
  expectedTranslation: `I do not know
Where the inside of my bright mirror acquired its autumn frost.`,
});

generatesTranslation({
  comment: "spaces",
  glossText: `[^the] mass[es] [of] birds 2[in the] high[:heights] fly 1vanish (away).
    [^a] lonely cloud 2[in] solitary[---ude] depart[s] 1tranquil[ly].
    2one_another 1^look[ing_at], both-do_not (neither) [of us] tire[s]_of [it].
    2only 1^there_is venerate-pavilion-mountain (Venerated_Pavilion_Mountain).`,
  expectedTranslation: `The masses of birds fly away in the heights.
    A lonely cloud departs tranquilly in solitude.
    Looking at one another, neither of us tires of it.
    There is only Venerated Pavilion Mountain.`,
});

generatesTranslation({
  comment: "punctuation",
  glossText: `2[the] pine[s] 1^below, [I] ask[ed] [the] juvenile-child (boy).
    [^he] say[-id], "[My] teacher 2[to] pick 3medicine 1depart (go[:went]).
    ^only, [he] is 2this (these) 3mountain[s] 1amid.
    [^the] cloud[s] [are_]deep; [I] do_not[:don't] know place (where)."`,
  expectedTranslation: `Below the pines, I asked the boy.
    He said, "My teacher went to pick medicine.
    Only, he is amid these mountains.
    The clouds are deep; I don't know where."`,
});

generatesTranslation({
  comment: "Padding placement",
  glossText:
    "^by_chance [I've] come [right here] 2[the] pine 3tree[s] 1beneath.",
  expectedTranslation: "By chance I've come right here beneath the pine trees.",
});

generatesTranslation({
  comment: "Padding placement 2",
  glossText:
    "2[with] each_other (one_another) [and] 1^stay[ing] dread[ing] [the] dawn bell.",
  expectedTranslation: "Staying with one another and dreading the dawn bell.",
});

generatesTranslation({
  glossText:
    "2on_the_contrary (actually) 1[I] doubt (wonder) [~\\, ], [am I] 3[a] dream 2inside (in) 1encounter (meet[ing]) [you]?",
  expectedTranslation: "I wonder, actually, am I meeting you in a dream?",
});

generatesTranslation({
  glossText: "^tears moist[en] [my] 2[of] vine-moss (vine) 1robe.",
  expectedTranslation: "Tears moisten my robe of vine.",
});

generatesTranslation({
  glossText: `be[:^there_were] [some] crow[s] [who] flock[ed]_together [in a] courtyard [upon a] tree [and] 2stretch 4[their_]neck[s] 3and[:~ing] 1sing (caw[ed]).`,
  expectedTranslation: `There were some crows who flocked together in a courtyard upon a tree and cawed stretching their necks.`,
});

generatesTranslation({
  glossText: `[His] father speak[:asked], "2[in] this w[-W]hat 1[is the] harm?"`,
  expectedTranslation: `His father asked, "What is the harm in this?"`,
});

generatesTranslation({
  glossText: `now[:Today] 4[are] sing[ing] 3that_which[:that] 2[the] crow[s] 1final_particle[:it_is], therefore [I have] hoot[ed]_at them."`,
  expectedTranslation: `Today it is the crows that are singing, therefore I have hooted at them."`,
});

generatesTranslation({
  glossText: `still[:Yet] [he] 2not[:~not] 1be_able[:can] beforehand-know (foresee) auspicious[:good_luck] [and] unlucky[:ill_luck].`,
  expectedTranslation: `Yet he cannot foresee good luck and ill luck.`,
});

generatesTranslation({
  glossText: `and-still_more (s[-S]till_more) [the] bird[s] [are not able to do it] exclamatory_particle[:~\\!]`,
  expectedTranslation: `Still more the birds are not able to do it!`,
  // debug: true,
});

function generatesTranslation({
  comment,
  glossText,
  expectedTranslation,
  debug = false,
}: {
  comment?: string;
  glossText: string;
  expectedTranslation: string;
  debug?: boolean;
}) {
  test(`Parses \`${comment || glossText}\``, () => {
    const parsed = parseGloss(glossText);
    expect(parsed.error).toEqual(undefined);
    if (!parsed.ok) return undefined;
    try {
      if (debug) {
        for (const tel of parsed.translation) {
          console.log("segment", tel);
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
  return parsed.ast.renderTranslation().runningText;
}
