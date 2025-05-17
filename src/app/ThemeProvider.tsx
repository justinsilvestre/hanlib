"use client";

import { useEffect, useState, type PropsWithChildren } from "react";
import { ThemeContext } from "./ThemeContext";

export default function ThemeProvider({ children }: PropsWithChildren<{}>) {
  const [mode, setModeState] = useState<"light" | "dark">("light");
  useEffect(() => {
    const osMode = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    if (localStorage.theme === "dark") {
      document.body.classList.add("dark");
      setModeState("dark");
      if (osMode === "dark") localStorage.removeItem("theme");
    } else if (localStorage.theme === "light") {
      document.body.classList.remove("dark");
      setModeState("light");
      if (osMode === "light") localStorage.removeItem("theme");
    } else {
      setModeState(osMode);
      if (osMode === "dark") {
        document.body.classList.add("dark");
      }
    }
  }, []);
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");

    const listenForModeSwitch = (event: MediaQueryListEvent): void => {
      const osMode = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      setMode(osMode);
    };
    query.addEventListener("change", listenForModeSwitch);
    return () => query.removeEventListener("change", listenForModeSwitch);
  }, []);

  const setMode = (newMode: "light" | "dark") => {
    if (newMode === "dark") {
      setModeState("dark");
      document.body.classList.add("dark");
      const osIsDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (!osIsDark) {
        localStorage.removeItem("theme");
      } else {
        localStorage.theme = "dark";
      }
    } else {
      setModeState("light");
      document.body.classList.remove("dark");
      const osIsDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (osIsDark) {
        localStorage.theme = "light";
      } else {
        localStorage.removeItem("theme");
      }
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: mode,
        setTheme: setMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
