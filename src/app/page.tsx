import Link from "next/link";
import { getTextsIdsAndTitles } from "./texts/files";

export default function Home() {
  const textsIdsAndTitles = getTextsIdsAndTitles();
  return (
    <main className="min-h-screen max-w-screen-xl m-auto p-4">
      <div className="mb-4 text-center">
        <h1 className="font-bold">Introduction to Literary Chinese</h1>
        <p className="text-sm">Adapted from the 1927 book by J. Brandt</p>
      </div>
      <ul className="ml-4 list-disc">
        {textsIdsAndTitles.map((text) => (
          <li key={text.textId}>
            <Link
              href={`/texts/${text.textId}`}
              className="underline hover:no-underline"
            >
              {text.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
