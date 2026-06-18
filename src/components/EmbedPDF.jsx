import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import EmbedPDFSnippet from "@embedpdf/snippet";

const MINIMAL_UI_SCHEMA = {
  id: "minimal",
  version: "1.0.0",
  toolbars: {},
  menus: {},
  sidebars: {},
  modals: {},
  selectionMenus: {},
};

const EMBED_THEME = {
  preference: "system",
  light: {
    background: {
      app: "#d9d9d9",
      surface: "#cdcdcd",
      surfaceAlt: "#c2c2c2",
      elevated: "#b6b6b6",
      overlay: "rgba(0, 0, 0, 0.16)",
      input: "#cdcdcd",
    },
    foreground: {
      primary: "#191919",
      secondary: "#272727",
      muted: "#626262",
      disabled: "#9a9a9a",
      onAccent: "#ffffff",
    },
    border: {
      default: "#9a9a9a",
      subtle: "#b6b6b6",
      strong: "#626262",
    },
    accent: {
      primary: "#2462ab",
      primaryHover: "#1d4c87",
      primaryActive: "#1c4270",
      primaryLight: "rgba(36, 98, 171, 0.16)",
      primaryForeground: "#ffffff",
    },
    interactive: {
      hover: "#c2c2c2",
      active: "#b6b6b6",
      selected: "#cdcdcd",
      focus: "#337ac4",
      focusRing: "#92bae7",
    },
    scrollbar: {
      track: "#b6b6b6",
      thumb: "#7c7c7c",
      thumbHover: "#626262",
    },
  },
  dark: {
    background: {
      app: "#1b1b1b",
      surface: "#323232",
      surfaceAlt: "#2e2e2e",
      elevated: "#2a2a2a",
      overlay: "rgba(0, 0, 0, 0.7)",
      input: "#2a2a2a",
    },
    foreground: {
      primary: "#f3f3f3",
      secondary: "#d1d1d1",
      muted: "#b4b4b4",
      disabled: "#5d5d5d",
      onAccent: "#ffffff",
    },
    border: {
      default: "#5d5d5d",
      subtle: "#2e2e2e",
      strong: "#989898",
    },
    accent: {
      primary: "#2462ab",
      primaryHover: "#1d4c87",
      primaryActive: "#1c4270",
      primaryLight: "rgba(36, 98, 171, 0.18)",
      primaryForeground: "#ffffff",
    },
    interactive: {
      hover: "#2e2e2e",
      active: "#2a2a2a",
      selected: "#323232",
      focus: "#337ac4",
      focusRing: "#92bae7",
    },
    scrollbar: {
      track: "#1f1f1f",
      thumb: "#3a3a3a",
      thumbHover: "#5d5d5d",
    },
  },
};

function EmbedPDF({ pdfBlob, className = "" }, ref) {
  const mountRef = useRef(null);
  const containerRef = useRef(null);
  const zoomRef = useRef(null);
  const shadowStyleRef = useRef(null);

  const url = useMemo(() => {
    if (!pdfBlob) return "";
    return URL.createObjectURL(pdfBlob);
  }, [pdfBlob]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  const initZoom = async (container) => {
    try {
      const registry = await container.registry;
      const zoomProvider =
        registry.getCapabilityProvider?.("zoom") || registry.getPlugin?.("zoom");
      const zoomCapability = zoomProvider?.provides?.() || null;
      zoomRef.current = zoomCapability;
    } catch (err) {
      console.error(err);
      zoomRef.current = null;
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      zoomIn: () => zoomRef.current?.zoomIn?.(),
      zoomOut: () => zoomRef.current?.zoomOut?.(),
      resetZoom: () => zoomRef.current?.requestZoom?.(1),
      getZoomPercent: () => {
        const zoomState = zoomRef.current?.getState?.();
        const current = zoomState?.currentZoomLevel;
        if (typeof current !== "number") return null;
        return Math.round(current * 100);
      },
    }),
    []
  );

  useEffect(() => {
    return () => {
      if (mountRef.current) mountRef.current.innerHTML = "";
      containerRef.current = null;
      zoomRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;
    if (!containerRef.current) {
      const container =
        EmbedPDFSnippet.init({
          type: "container",
          target: mountRef.current,
          src: url || undefined,
          disabledCategories: ["annotation", "redaction", "form"],
          ui: { schema: MINIMAL_UI_SCHEMA },
          theme: EMBED_THEME,
        }) || null;

      containerRef.current = container;
      if (container) initZoom(container);
      return;
    }

    containerRef.current.config = {
      ...(containerRef.current.config || {}),
      src: url || undefined,
      disabledCategories: ["annotation", "redaction", "form"],
      ui: { schema: MINIMAL_UI_SCHEMA },
      theme: EMBED_THEME,
    };
  }, [url]);

  useEffect(() => {
    const container = containerRef.current;
    const root = container?.shadowRoot;
    if (!root) return;

    if (!shadowStyleRef.current) {
      const style = document.createElement("style");
      style.setAttribute("data-embedpdf-mobile-center", "true");
      style.textContent = `
@media (max-width: 768px) {
  #document-content > .flex-1 {
    display: flex !important;
    align-items: safe center !important;
    justify-content: safe center !important;
  }

  #document-content > .flex-1 > .relative.h-full.w-full {
    display: flex !important;
    align-items: safe center !important;
    justify-content: safe center !important;
  }

  #document-content .bg-bg-app {
    display: flex !important;
    align-items: safe center !important;
    justify-content: safe center !important;
  }
}
      `.trim();
      root.appendChild(style);
      shadowStyleRef.current = style;
    }
  }, [url]);

  if (!pdfBlob) {
    return (
      <div
        className={`h-full w-full rounded-md border border-nero-600 bg-nero-900 p-3 ${className}`}
      >
        <div className="h-full w-full flex items-center justify-center text-sm text-nero-300">
          Waiting for preview...
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`h-full w-full rounded-md border border-nero-600 bg-nero-900 overflow-hidden ${className}`}
    />
  );
}

const ForwardedEmbedPDF = forwardRef(EmbedPDF);
ForwardedEmbedPDF.displayName = "EmbedPDF";
export default ForwardedEmbedPDF;
