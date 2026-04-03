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

function EmbedPDF({ pdfBlob, className = "" }, ref) {
  const mountRef = useRef(null);
  const containerRef = useRef(null);
  const zoomRef = useRef(null);

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
          theme: {
            preference: "dark",
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
          },
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
      theme: {
        preference: "dark",
        dark: {
          ...(containerRef.current.config?.theme?.dark || {}),
          background: {
            ...(containerRef.current.config?.theme?.dark?.background || {}),
            app: "#1b1b1b",
            surface: "#323232",
            surfaceAlt: "#2e2e2e",
            elevated: "#2a2a2a",
            overlay: "rgba(0, 0, 0, 0.7)",
            input: "#2a2a2a",
          },
          foreground: {
            ...(containerRef.current.config?.theme?.dark?.foreground || {}),
            primary: "#f3f3f3",
            secondary: "#d1d1d1",
            muted: "#b4b4b4",
            disabled: "#5d5d5d",
            onAccent: "#ffffff",
          },
          border: {
            ...(containerRef.current.config?.theme?.dark?.border || {}),
            default: "#5d5d5d",
            subtle: "#2e2e2e",
            strong: "#989898",
          },
          accent: {
            ...(containerRef.current.config?.theme?.dark?.accent || {}),
            primary: "#2462ab",
            primaryHover: "#1d4c87",
            primaryActive: "#1c4270",
            primaryLight: "rgba(36, 98, 171, 0.18)",
            primaryForeground: "#ffffff",
          },
          interactive: {
            ...(containerRef.current.config?.theme?.dark?.interactive || {}),
            hover: "#2e2e2e",
            active: "#2a2a2a",
            selected: "#323232",
            focus: "#337ac4",
            focusRing: "#92bae7",
          },
          scrollbar: {
            ...(containerRef.current.config?.theme?.dark?.scrollbar || {}),
            track: "#1f1f1f",
            thumb: "#3a3a3a",
            thumbHover: "#5d5d5d",
          },
        },
      },
    };
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
