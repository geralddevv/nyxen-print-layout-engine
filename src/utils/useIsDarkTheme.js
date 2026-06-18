import { useSyncExternalStore } from "react";

// Resolves the active theme the same way the rest of the app does: an explicit
// data-theme / class wins, otherwise fall back to the OS preference.
const isDarkThemeActive = () => {
  if (typeof window === "undefined") return false;

  const root = document.documentElement;
  const body = document.body;
  const explicitTheme = root.dataset.theme || body?.dataset.theme || "";

  if (explicitTheme === "dark") return true;
  if (explicitTheme === "light") return false;

  if (root.classList.contains("dark") || body?.classList.contains("dark")) {
    return true;
  }

  if (root.classList.contains("light") || body?.classList.contains("light")) {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

// A single shared subscription feeds every consumer, so mounting many preset
// cards no longer creates one MutationObserver + media listener per card.
const listeners = new Set();
let current = isDarkThemeActive();
let observer = null;
let mediaQuery = null;

const notify = () => {
  const next = isDarkThemeActive();
  if (next === current) return;
  current = next;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener) => {
  listeners.add(listener);

  if (listeners.size === 1 && typeof window !== "undefined") {
    current = isDarkThemeActive();
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", notify);

    observer = new MutationObserver(notify);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["class", "data-theme"],
      });
    }
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      observer?.disconnect();
      observer = null;
      mediaQuery?.removeEventListener("change", notify);
      mediaQuery = null;
    }
  };
};

const getSnapshot = () => current;
const getServerSnapshot = () => false;

export const useIsDarkTheme = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
