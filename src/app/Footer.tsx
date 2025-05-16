"use client";

import { useContext } from "react";
import { ThemeContext } from "./ThemeProvider";

export function Footer() {
  const { mode, setMode } = useContext(ThemeContext);
  return (
    <footer className="max-w-screen-lg p-4 m-auto text-right">
      {mode === "light" ? (
        <button
          onClick={() => {
            setMode("dark");
          }}
        >
          ☾ dark
        </button>
      ) : (
        <button
          onClick={() => {
            setMode?.("light");
          }}
        >
          ☼ light
        </button>
      )}
    </footer>
  );
}
