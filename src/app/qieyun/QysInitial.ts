export type QysInitial = keyof typeof QYS_INITIALS;

export const QYS_INITIALS = {
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

export const initialGroups = {
  幫: new Set<QysInitial>(["幫", "滂", "並", "明"]),
  端: new Set<QysInitial>(["端", "透", "定", "泥"]),
  來: new Set<QysInitial>(["來"]),
  知: new Set<QysInitial>(["知", "徹", "澄", "孃"]),
  精: new Set<QysInitial>(["精", "清", "從", "心", "邪"]),
  莊: new Set<QysInitial>(["莊", "初", "崇", "生", "俟"]),
  章: new Set<QysInitial>(["章", "昌", "常", "書", "船"]),
  日: new Set<QysInitial>(["日"]),
  見: new Set<QysInitial>(["見", "溪", "羣", "疑"]),
  影: new Set<QysInitial>(["影", "曉", "匣", "云"]),
  以: new Set<QysInitial>(["以"]),
};
const initialToGroup = Object.fromEntries(
  Object.entries(initialGroups).flatMap(([group, initials]) =>
    Array.from(initials, (initial) => [initial, group])
  )
);
export const getInitialGroup = (initial: string) =>
  (initialToGroup[initial] as keyof typeof initialGroups) || null;
