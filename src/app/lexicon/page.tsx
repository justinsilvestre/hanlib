import { getLexiconFileContents } from "../texts/files";

export default async function LexiconRoute() {
  const lexicon = await getLexiconFileContents();

  const englishDefinedTerms = Object.entries(lexicon.vocab).flatMap(
    ([term, entries = []]) =>
      entries.filter((e) => e.en).map((entry) => ({ term, entry }))
  );
  return (
    <main className="min-h-screen max-w-screen-xl m-auto p-4">
      <div className="mb-4 text-center">
        <h1 className="font-bold">Lexicon</h1>
      </div>
      <p>{englishDefinedTerms.length} defined terms</p>
      <p>
        {englishDefinedTerms.filter(({ term }) => term.length === 1).length}{" "}
        defined characters
      </p>

      <dl className="">
        {Object.entries(lexicon.vocab).flatMap(
          ([term, entries = []], termIndex) =>
            entries
              .filter((e) => e.en)
              .map((entry, entryIndex) => (
                <div key={`${termIndex}.${entryIndex}`}>
                  <dt className="inline">{term}</dt>
                  <dd className="inline"> {entry.en}</dd>
                </div>
              ))
        )}
      </dl>
    </main>
  );
}
