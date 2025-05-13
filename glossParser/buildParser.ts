const peggy = require("peggy");
const fs = require("fs");
const path = require("path");
const parser = peggy.generate(
  fs.readFileSync(path.join(__dirname, "glossGrammar.pegjs"), "utf8"),
  {
    output: "source",
    format: "commonjs",
  }
);
fs.mkdirSync(path.join(__dirname, "build"), { recursive: true });
const outputPath = path.join(__dirname, "build", "glossParser.ts");
fs.writeFileSync(outputPath, parser, "utf8");

console.log(`Wrote to ${outputPath}`);
