import Link from "next/link";
import { getTextsIdsAndTitles } from "./texts/files";

// prettier-ignore
const GLOSSED = [
  'brandt-ch01-1', 'brandt-ch01-2', 'brandt-ch01-3', 
  'brandt-ch02-1', 'brandt-ch02-2', 'brandt-ch02-3',
  'brandt-ch03-1', 'brandt-ch03-2', 'brandt-ch03-3',
  'brandt-ch04-1', 'brandt-ch04-2', 'brandt-ch04-3',
  'brandt-ch05-1', 'brandt-ch05-2',
]

// prettier-ignore
const LESSONS_AND_TEXTS = [[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3,4],[1,2,3,4],[1,2,3,4],[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2],[1,2],[1,2],[1,2],[1,2],[1,2],[1,2],[1,2],[1,2],[1,2],[1,2]]

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

      <ul className="ml-4">
        {LESSONS_AND_TEXTS.map((lesson, i) => {
          const lessonNumber = i + 1;
          return (
            <li key={i}>
              <h2 className="font-bold">Lesson {lessonNumber}</h2>
              <span className="">
                {lesson.map((textNumber) => {
                  const textId = `brandt-ch${lessonNumber
                    .toString()
                    .padStart(2, "0")}-${textNumber}`;
                  const text = textsIdsAndTitles.find(
                    (t) => t.textId === textId
                  )!;
                  return (
                    <span key={textId} className="inline-block mx-2">
                      {" "}
                      <Link
                        href={`/texts/${textId}`}
                        className="underline hover:no-underline"
                      >
                        {text.preview}
                        {!GLOSSED.includes(textId) && "*"}
                      </Link>
                    </span>
                  );
                })}
              </span>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
