import { useEffect, useState } from "react";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useLayout } from "../../../context/LayoutProvider";
import { mmToPt, ptToMm } from "../../../utils/unitConversion";

const MarginInput = ({ label }) => {
  const layout = useLayout();

  const keyMap = {
    Top: "topMargin",
    Bottom: "bottomMargin",
    Left: "leftMargin",
    Right: "rightMargin",
  };

  const key = keyMap[label];
  const valuePt = layout.values[key];

  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const mm = ptToMm(valuePt);
    setInputValue(String(Number(mm.toFixed(2))));
  }, [valuePt]);

  const update = (mmValue) => {
    setInputValue(mmValue);

    const num = Number(mmValue);
    if (Number.isNaN(num)) return;

    const pt = mmToPt(num);
    layout.set[`set${label}Margin`](pt);
    layout.set.setUserMarginOverride(true);
  };

  const increase = () => update((Number(inputValue) || 0) + 1);
  const decrease = () => update((Number(inputValue) || 0) - 1);

  return (
    <div className="w-[50%] flex flex-col gap-0.5">
      <label className="text-sm text-nero-400 font-medium">{label}</label>

      <div className="w-full h-8 flex rounded-md">
        <div className="h-8 w-6 bg-nero-750 border border-nero-600 border-r-0 flex flex-col rounded-bl-md rounded-tl-md overflow-hidden">
          <button
            type="button"
            onClick={increase}
            className="flex-1 flex items-center justify-center text-nero-400 hover:text-nero-300"
          >
            <KeyboardArrowUpIcon sx={{ fontSize: 16, marginBottom: "-2px" }} />
          </button>
          <button
            type="button"
            onClick={decrease}
            className="flex-1 flex items-center justify-center text-nero-400 hover:text-nero-300"
          >
            <KeyboardArrowDownIcon sx={{ fontSize: 16, marginTop: "-2px" }} />
          </button>
        </div>

        <input
          type="number"
          value={inputValue}
          onChange={(e) => update(e.target.value)}
          onFocus={(e) => e.target.select()}
          className="no-spinner w-[80%] h-8 px-2 py-1 bg-nero-700 border border-nero-600 rounded-md rounded-bl-none rounded-tl-none text-sm focus:outline-none focus:ring-2 focus:ring-nero-500 z-10"
        />
      </div>
    </div>
  );
};

export default MarginInput;
