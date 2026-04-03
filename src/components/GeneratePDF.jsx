import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, View, pdf } from "@react-pdf/renderer";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import EmbedPDF from "./EmbedPDF";
import { useLayout } from "../context/LayoutProvider";
import { computeAutoMargins } from "../utils/computeAutoMargins";
import TokenTemplate from "../utils/TokenTemplate";
import { addTrimMarksToPDF } from "../utils/TrimMarksPDFLib";
import Toast from "../utils/Toast";

const buildGrid = (values) => {
  const {
    paperWidthPt,
    paperHeightPt,
    couponWidthPt,
    couponHeightPt,
    leftMargin,
    rightMargin,
    topMargin,
    bottomMargin,
    gapXPt,
    gapYPt,
  } = values;

  const hasSizes =
    paperWidthPt > 0 &&
    paperHeightPt > 0 &&
    couponWidthPt > 0 &&
    couponHeightPt > 0;

  if (!hasSizes) {
    return {
      ready: false,
      message: "Set both page and label sizes to continue.",
      columns: 0,
      rows: 0,
      count: 0,
      gapX: 0,
      gapY: 0,
    };
  }

  const gapX = gapXPt || 0;
  const gapY = gapYPt || 0;

  const usableW = paperWidthPt - leftMargin - rightMargin;
  const usableH = paperHeightPt - topMargin - bottomMargin;

  if (usableW <= 0 || usableH <= 0) {
    return {
      ready: false,
      message: "Margins are larger than the page area.",
      columns: 0,
      rows: 0,
      count: 0,
      gapX,
      gapY,
    };
  }

  const columns = Math.max(
    0,
    Math.floor((usableW + gapX) / (couponWidthPt + gapX))
  );
  const rows = Math.max(
    0,
    Math.floor((usableH + gapY) / (couponHeightPt + gapY))
  );

  const count = columns * rows;

  if (!columns || !rows) {
    return {
      ready: false,
      message: "Label size is too large to fit on the page.",
      columns,
      rows,
      count,
      gapX,
      gapY,
    };
  }

  return {
    ready: true,
    message: "",
    columns,
    rows,
    count,
    gapX,
    gapY,
  };
};

export default function GeneratePDF({ resetSignal }) {
  const layout = useLayout();
  const { values } = layout;
  const reduceMotion = useReducedMotion();

  const [pdfBlob, setPdfBlob] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [previewZoomPct, setPreviewZoomPct] = useState(100);
  const previewViewerRef = useRef(null);

  const grid = useMemo(() => buildGrid(values), [values]);

  useEffect(() => {
    if (!values.userMarginOverride) {
      computeAutoMargins(layout);
    }
  }, [
    layout,
    values.userMarginOverride,
    values.paperWidthPt,
    values.paperHeightPt,
    values.couponWidthPt,
    values.couponHeightPt,
    values.gapXPt,
    values.gapYPt,
  ]);

  useEffect(() => {
    setPdfBlob(null);
    setStatusMsg("");
    setError("");
    setIsPreviewOpen(false);
    setShowToast(false);
    setPreviewZoomPct(100);
  }, [
    resetSignal,
    values.paperWidthPt,
    values.paperHeightPt,
    values.couponWidthPt,
    values.couponHeightPt,
    values.gapXPt,
    values.gapYPt,
    values.leftMargin,
    values.rightMargin,
    values.topMargin,
    values.bottomMargin,
  ]);

  const labelNumbers = useMemo(
    () => Array.from({ length: grid.count }, (_, idx) => idx + 1),
    [grid.count]
  );

  const handleDownload = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");

    // Format the number to max 2 decimal places, removing trailing zeros
    const formatDim = (pt, unit) => {
      const val = unit === "mm" ? pt / 2.8346456693 : pt / 72;
      return parseFloat(val.toFixed(2));
    };

    const pW = formatDim(values.paperWidthPt, values.paperUnit);
    const pH = formatDim(values.paperHeightPt, values.paperUnit);
    const cW = formatDim(values.couponWidthPt, values.couponUnit);
    const cH = formatDim(values.couponHeightPt, values.couponUnit);

    a.href = url;
    a.download = `Sheet size - ${pW} x ${pH} ${values.paperUnit}, Label size - ${cW} x ${cH} ${values.couponUnit}.pdf`;

    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async () => {
    if (!grid.ready) {
      setError(grid.message || "Please set sizes before generating.");
      return false;
    }

    setIsGenerating(true);
    setError("");
    setStatusMsg("");

    try {
      const doc = (
        <Document>
          <Page
            size={{ width: values.paperWidthPt, height: values.paperHeightPt }}
            style={{ position: "relative" }}
          >
            {labelNumbers.map((num, idx) => {
              const row = Math.floor(idx / grid.columns);
              const col = idx % grid.columns;

              const x = values.leftMargin + col * (values.couponWidthPt + grid.gapX);
              const y = values.topMargin + row * (values.couponHeightPt + grid.gapY);

              return (
                <View
                  key={num}
                  style={{
                    position: "absolute",
                    left: x,
                    top: y,
                    width: values.couponWidthPt,
                    height: values.couponHeightPt,
                  }}
                >
                  <TokenTemplate
                    labelNumber={num}
                    couponWidthPt={values.couponWidthPt}
                    couponHeightPt={values.couponHeightPt}
                  />
                </View>
              );
            })}
          </Page>
        </Document>
      );

      const blob = await pdf(doc).toBlob();
      const rawBytes = await blob.arrayBuffer();

      const trimmed = await addTrimMarksToPDF(rawBytes, {
        ...values,
        gapXPt: values.gapXPt || 0,
        gapYPt: values.gapYPt || 0,
      });

      setPdfBlob(new Blob([trimmed], { type: "application/pdf" }));
      setStatusMsg(`${grid.count} labels on a single page.`);
      return true;
    } catch (err) {
      console.error(err);
      setError("Failed to generate the PDF. Please try again.");
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = async () => {
    if (!grid.ready) {
      setToastMessage(grid.message || "Please set sizes before previewing.");
      setShowToast(true);
      return;
    }

    if (!pdfBlob) {
      const generated = await handleGenerate();
      if (!generated) return;
    }

    setIsPreviewOpen(true);
  };

  useEffect(() => {
    if (!isPreviewOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handle = setTimeout(() => {
      const pct = previewViewerRef.current?.getZoomPercent?.();
      if (typeof pct === "number") setPreviewZoomPct(pct);
    }, 0);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(handle);
    };
  }, [isPreviewOpen]);

  const detailLine = grid.ready
    ? `${grid.columns} columns x ${grid.rows} rows (${grid.count} labels)`
    : grid.message;

  return (
    <div className="w-full flex flex-col items-center bg-nero-800 p-2.5 gap-3">
      <div className="w-full flex flex-col gap-1">
        <div className="flex items-center justify-between text-sm text-nero-300">
          <span>Labels per page</span>
          <span className="font-semibold">{grid.count || "-"}</span>
        </div>
        <div className="text-xs text-nero-400">{detailLine}</div>
      </div>

      <div className="w-full flex">
        <button
          onClick={handlePreview}
          disabled={isGenerating || !grid.ready}
          className={`flex-1 h-10 px-3 rounded-md text-sm font-medium transition-all ${isGenerating || !grid.ready
            ? "bg-nero-700 text-nero-500 cursor-not-allowed"
            : "bg-denim-600 text-white hover:bg-denim-700 active:scale-95"
            }`}
        >
          {isGenerating ? "Generating..." : "Preview"}
        </button>
      </div>

      {statusMsg && (
        <div className="w-full text-xs text-green-200 bg-nero-750 border border-nero-600 rounded-md px-3 py-2">
          {statusMsg}
        </div>
      )}

      {error && (
        <div className="w-full text-xs text-red-200 bg-nero-750 border border-red-300 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <Toast
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
      />

      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-nero-900/85"
            onClick={() => setIsPreviewOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
          >
            <motion.div
              className="w-full h-full bg-nero-800 border border-nero-700 shadow-xl flex flex-col overflow-hidden"
              onClick={(event) => event.stopPropagation()}
              initial={{ opacity: 0, scale: 0.985, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.985, y: 6 }}
              transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
            >
            <div className="grid grid-cols-3 items-center px-4 py-3 border-b border-nero-700 text-nero-300">
              <span className="justify-self-start text-sm font-semibold">Preview</span>

              <div className="justify-self-center">
                <div className="flex items-center gap-1 rounded-md bg-nero-700 p-0.5">
                  <button
                    onClick={() => {
                      previewViewerRef.current?.zoomOut?.();
                      const pct = previewViewerRef.current?.getZoomPercent?.();
                      if (typeof pct === "number") setPreviewZoomPct(pct);
                    }}
                    disabled={!pdfBlob}
                    className={`h-7 w-7 rounded-md text-nero-200 active:scale-95 ${pdfBlob ? "hover:bg-nero-600" : "opacity-50 cursor-not-allowed"
                      }`}
                    aria-label="Zoom out"
                  >
                    –
                  </button>
                  <span className="px-2 text-xs text-nero-300 min-w-11 text-center tabular-nums">
                    {previewZoomPct}%
                  </span>
                  <button
                    onClick={() => {
                      previewViewerRef.current?.zoomIn?.();
                      const pct = previewViewerRef.current?.getZoomPercent?.();
                      if (typeof pct === "number") setPreviewZoomPct(pct);
                    }}
                    disabled={!pdfBlob}
                    className={`h-7 w-7 rounded-md text-nero-200 active:scale-95 ${pdfBlob ? "hover:bg-nero-600" : "opacity-50 cursor-not-allowed"
                      }`}
                    aria-label="Zoom in"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="justify-self-end flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  disabled={!pdfBlob}
                  className={`h-8 px-3 rounded-md text-sm font-medium transition-all ${pdfBlob
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95"
                    : "bg-nero-700 text-nero-500 cursor-not-allowed"
                    }`}
                  aria-label="Download"
                >
                  <span className="hidden sm:inline">Download</span>
                  <span className="inline sm:hidden">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                      <path
                        d="M12 3v10m0 0l4-4m-4 4l-4-4M5 20h14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="h-8 px-3 rounded-md text-sm font-medium bg-nero-700 text-nero-200 hover:bg-nero-600 active:scale-95"
                  aria-label="Close preview"
                >
                  <span className="hidden sm:inline">Close</span>
                  <span className="inline sm:hidden text-lg leading-none">×</span>
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 bg-nero-750">
              <EmbedPDF
                ref={previewViewerRef}
                pdfBlob={pdfBlob}
                className="h-full w-full border-0 rounded-none"
              />
            </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
