// src/context/LayoutProvider.jsx
import { createContext, useContext, useState } from "react";
import { MM_TO_PT } from "../utils/unitConversion";

const LayoutContext = createContext();

export const LayoutProvider = ({ children }) => {
  // Units
  const [paperUnit, setPaperUnit] = useState("in");
  const [couponUnit, setCouponUnit] = useState("mm");

  // Papers
  const [paperWidthPt, setPaperWidthPt] = useState(0);
  const [paperHeightPt, setPaperHeightPt] = useState(0);

  // Coupons
  const [couponWidthPt, setCouponWidthPt] = useState(0);
  const [couponHeightPt, setCouponHeightPt] = useState(0);

  // Orientation
  const [orientation, setOrientation] = useState("portrait");

  // Font scaling
  const [fontScale, setFontScale] = useState(1);

  // Margins
  const [rightMargin, setRightMargin] = useState(0);
  const [leftMargin, setLeftMargin] = useState(0);
  const [topMargin, setTopMargin] = useState(0);
  const [bottomMargin, setBottomMargin] = useState(0);

  // Gaps
  const [gapXPt, setGapXPt] = useState(0 * MM_TO_PT);
  const [gapYPt, setGapYPt] = useState(0 * MM_TO_PT);

  const [userMarginOverride, setUserMarginOverride] = useState(false);

  // Tells SizeConfigPanel that a preset updated sizes
  const [presetUpdate, setPresetUpdate] = useState(false);

  const layout = {
    values: {
      paperUnit,
      couponUnit,
      paperWidthPt,
      paperHeightPt,
      couponWidthPt,
      couponHeightPt,
      orientation,
      fontScale,
      rightMargin,
      leftMargin,
      topMargin,
      bottomMargin,
      userMarginOverride,
      presetUpdate,
      gapXPt,
      gapYPt,
    },

    set: {
      setPaperUnit,
      setCouponUnit,
      setPaperWidthPt,
      setPaperHeightPt,
      setCouponWidthPt,
      setCouponHeightPt,
      setOrientation,
      setFontScale,
      setRightMargin,
      setLeftMargin,
      setTopMargin,
      setBottomMargin,
      setUserMarginOverride,
      setPresetUpdate,
      setGapXPt,
      setGapYPt,
    },
  };

  return (
    <LayoutContext.Provider value={layout}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => useContext(LayoutContext);
