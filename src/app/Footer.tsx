"use client";

import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

export function Footer() {
  const { theme: mode, setTheme: setMode } = useContext(ThemeContext);
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
