import Link from "next/link";
import { getTextsIdsAndTitles } from "./texts/files";

// prettier-ignore
const GLOSSED = [
  'brandt-ch01-1', 'brandt-ch01-2', 'brandt-ch01-3', 
  'brandt-ch02-1', 'brandt-ch02-2', 'brandt-ch02-3',
  'brandt-ch03-1', 'brandt-ch03-2', 'brandt-ch03-3',
  'brandt-ch04-1', 'brandt-ch04-2', 'brandt-ch04-3',
]

export default function Home() {
  const textsIdsAndTitles = getTextsIdsAndTitles();
  return (
    <main className="min-h-screen max-w-screen-xl m-auto p-4">
      <div className="mb-4 text-center">
        <h1 className="font-bold">Introduction to Literary Chinese</h1>
        <p className="text-sm">Adapted from the 1927 book by J. Brandt</p>
      </div>

      <p className="mb-4">
        Passages marked with * have been transcribed but not yet glossed.
      </p>

      <ul className="ml-4 list-disc">
        {textsIdsAndTitles.map((text) => (
          <li key={text.textId}>
            <Link
              href={`/texts/${text.textId}`}
              className="underline hover:no-underline"
            >
              {text.title}
              {!GLOSSED.includes(text.textId) && "*"}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
