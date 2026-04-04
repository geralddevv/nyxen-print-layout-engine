// /src/utils/computeAutoMargins.js

import { getGridFit } from "./grid";

export function computeAutoMargins(layout) {
  const {
    paperWidthPt,
    paperHeightPt,
    couponWidthPt,
    couponHeightPt,
    gapXPt,
    gapYPt,
  } = layout.values;

  if (!paperWidthPt || !paperHeightPt || !couponWidthPt || !couponHeightPt) {
    return;
  }

  const { usedW, usedH } = getGridFit({
    paperWidthPt,
    paperHeightPt,
    couponWidthPt,
    couponHeightPt,
    gapXPt,
    gapYPt,
  });

  let marginX = Math.max(0, (paperWidthPt - usedW) / 2);
  let marginY = Math.max(0, (paperHeightPt - usedH) / 2);

  // Soft reduction
  const reduceX = paperWidthPt * 0.00008;
  const reduceY = paperHeightPt * 0.00008;

  marginX -= reduceX;
  marginY -= reduceY;

  // APPLY the recalculated margins
  layout.set.setLeftMargin(marginX);
  layout.set.setRightMargin(marginX);
  layout.set.setTopMargin(marginY);
  layout.set.setBottomMargin(marginY);
}
