const fs = require("fs");

const text = fs.readFileSync("./docs/brandt.md", "utf-8");

const listText = text.match(
  /<!-- begin tasks list -->([\s\S]*?)<!-- end tasks list -->/
)![1];

const progress = parseMarkdownProgressList(listText);
console.log(progress);

const totalTasks = Object.values(progress.categoryTasks).reduce(
  (acc, { total }) => acc + total,
  0
);
const completedTasks = Object.values(progress.categoryTasks).reduce(
  (acc, { completed }) => acc + completed,
  0
);
const totalProgressPercent = (completedTasks / totalTasks) * 100;
console.log(
  `total progress: ${completedTasks}/${totalTasks} (${totalProgressPercent.toFixed(
    2
  )}%)`
);
console.log(getAsciiProgressBar(completedTasks, totalTasks));

for (const [category, { completed, total }] of Object.entries(
  progress.categoryTasks
)) {
  console.log(
    `${category}: ${completed}/${total} (${((completed / total) * 100).toFixed(
      2
    )}%)`
  );
  // progress bar e.g.
  // [=========================                         ] 50%
  console.log(getAsciiProgressBar(completed, total));
}

function getAsciiProgressBar(completed: number, total: number): any {
  return `[${"=".repeat(Math.round((completed / total) * 50)).padEnd(50)}]\n`;
}

function parseMarkdownProgressList(listText: string) {
  const categoryTasks: Record<
    string,
    {
      total: number;
      completed: number;
    }
  > = {};

  const lines = listText.split("\n");
  let currentCategory: string | null = null;

  lines.forEach((line) => {
    // Match task completion
    const taskMatch = /^\s*-\s*\[(.)\]\s*(.+)/.exec(line);
    if (taskMatch) {
      const completed = taskMatch[1] === "x";
      const taskDesc = taskMatch[2];

      if (currentCategory) {
        categoryTasks[currentCategory].total++;
        if (completed) {
          categoryTasks[currentCategory].completed++;
        }
      }
    }

    const categoryMatch = line.match(/^\s+- ([^[].+)/);
    if (categoryMatch) {
      currentCategory = categoryMatch[1];
      categoryTasks[currentCategory] ||= { total: 0, completed: 0 };
    }
  });

  return {
    categoryTasks,
  };
}
