"use client";
import { createContext } from "react";

export const ThemeContext = createContext<
  | {
      theme: "light" | "dark";
      setTheme: (mode: "light" | "dark") => void;
    }
  | {
      theme?: undefined;
      setTheme?: undefined;
    }
>({});
