export const MM_TO_PT = 2.834645669;
export const IN_TO_PT = 72;

const round = (value, precision) => {
  if (typeof precision !== "number") return value;
  return Number(value.toFixed(precision));
};

export const mmToPt = (mm, precision) => round(mm * MM_TO_PT, precision);
export const ptToMm = (pt, precision) => round(pt / MM_TO_PT, precision);
export const inToPt = (inch, precision) => round(inch * IN_TO_PT, precision);
export const ptToIn = (pt, precision) => round(pt / IN_TO_PT, precision);
