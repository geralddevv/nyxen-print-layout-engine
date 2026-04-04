export const getGridFit = ({
  paperWidthPt,
  paperHeightPt,
  couponWidthPt,
  couponHeightPt,
  gapXPt = 0,
  gapYPt = 0,
}) => {
  const gapX = gapXPt || 0;
  const gapY = gapYPt || 0;

  const columns = Math.max(
    0,
    Math.floor((paperWidthPt + gapX) / (couponWidthPt + gapX))
  );
  const rows = Math.max(
    0,
    Math.floor((paperHeightPt + gapY) / (couponHeightPt + gapY))
  );

  const usedW = columns * couponWidthPt + Math.max(0, columns - 1) * gapX;
  const usedH = rows * couponHeightPt + Math.max(0, rows - 1) * gapY;

  return {
    columns,
    rows,
    usedW,
    usedH,
    gapX,
    gapY,
    count: columns * rows,
  };
};

export const buildGrid = (values) => {
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
