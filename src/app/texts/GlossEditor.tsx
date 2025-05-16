"use client";
import { shikiToMonaco } from "@shikijs/monaco";
import * as monaco from "monaco-editor";
import { createHighlighter } from "shiki";
import loader from "@monaco-editor/loader";
import hanlibGlossedText from "./syntaxes/hanlib-glossed-text.tmLanguage.json";
import hgl from "./syntaxes/hgl.tmLanguage.json";
import { useState, useCallback, useContext, useEffect, useRef } from "react";
import { ThemeContext } from "@/app/ThemeProvider";

// TODO: fix behavior when resizing window smaller

export default function GlossEditor({
  onChange,
  initialValue = "",
  className,
}: {
  onChange?: (value: string) => void;
  initialValue?: string;
  className?: string;
}) {
  const { mode } = useContext(ThemeContext);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const onChangeRef = useRef(onChange);
  const [highlighter, setHighlighter] =
    useState<Awaited<ReturnType<typeof createHighlighter> | null>>(null);
  useEffect(() => {
    if (!highlighter)
      createHighlighter({
        themes: ["github-dark", "github-light"],
        // langs: ["hgl", "hanlib"],
        langs: [hanlibGlossedText, hgl],
      }).then((highlighter) => {
        setHighlighter(highlighter);
      });
    return () => {
      highlighter?.dispose();
    };
  }, [highlighter]);
  const [monaco, setMonaco] =
    useState<Awaited<ReturnType<typeof loader.init> | null>>(null);
  useEffect(() => {
    if (!monaco)
      loader.init().then((monaco) => {
        setMonaco(monaco);
      });
  }, [monaco]);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (monaco && highlighter && containerRef.current) {
      // Register the languageIds first. Only registered languages will be highlighted.
      monaco.languages.register({ id: "hgl" });
      monaco.languages.register({ id: "Hanlib Glossed Text" });
      // Create the highlighter, it can be reused

      // Register the themes from Shiki, and provide syntax highlighting for Monaco.
      shikiToMonaco(highlighter, monaco);

      // Create the editor
      const editor = monaco.editor.create(containerRef.current, {
        value: initialValue,
        language: "Hanlib Glossed Text",
        theme: mode === "dark" ? "github-dark" : "github-light",
        wordWrap: "on",
      });
      editorRef.current = editor;

      // resize the editor to fit the container
      const resizeObserver = new ResizeObserver(() => {
        editor.layout();
      });
      resizeObserver.observe(containerRef.current);
      resizeObserverRef.current = resizeObserver;

      editor.getModel()?.onDidChangeContent(() => {
        const value = editor.getValue();
        if (onChangeRef.current) onChangeRef.current(value);
      });
    }
    // should not have mode here
  }, [monaco, highlighter, initialValue]);
  useEffect(() => {
    // Cleanup the editor on unmount
    return () => {
      if (editorRef.current) {
        console.log("disposing editor");
        editorRef.current.dispose();
        editorRef.current = null;
      } else {
        console.log("editorRef.current is null");
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        theme: mode === "dark" ? "github-dark" : "github-light",
      });
    }
  }, [mode]);

  return (
    <div
      className={className}
      style={{ width: "100%", height: "100%" }}
      ref={containerRef}
    ></div>
  );
}
