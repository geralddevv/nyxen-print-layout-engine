import { useLayout } from "../../context/LayoutProvider";
import { useRefresh } from "../../context/RefreshContext";
import { mmToPt, ptToMm } from "../../utils/unitConversion";

const GapInput = () => {
  const {
    values: { gapXPt, gapYPt },
    set: { setGapXPt, setGapYPt },
  } = useLayout();

  const { handleRefresh } = useRefresh();

  const gapXmm = gapXPt == null ? "" : ptToMm(gapXPt, 2);
  const gapYmm = gapYPt == null ? "" : ptToMm(gapYPt, 2);

  const handleGapXChange = (value) => {
    if (value === "") {
      setGapXPt(null);
      setGapYPt(null);
      return;
    }

    const mm = Number(value);
    if (Number.isNaN(mm)) return;

    const pt = mmToPt(mm, 3);

    setGapXPt(pt);
    setGapYPt(pt);
    handleRefresh();
  };

  const handleGapYChange = (value) => {
    if (value === "") {
      setGapYPt(null);
      return;
    }

    const mm = Number(value);
    if (Number.isNaN(mm)) return;

    setGapYPt(mmToPt(mm, 3));
    handleRefresh();
  };

  return (
    <>
      <div className="w-full flex">
        <div className="w-[60%] h-8 flex items-center justify-center bg-nero-750 border border-nero-600 border-r-0 text-sm rounded-bl-md rounded-tl-md">
          Gap X
        </div>

        <input
          type="number"
          value={gapXmm}
          onChange={(e) => handleGapXChange(e.target.value)}
          onFocus={(e) => e.target.select()}
          onBlur={(e) => {
            if (e.target.value === "") handleGapXChange("0");
          }}
          className="no-spinner w-[40%] h-8 px-2 py-1 bg-nero-700 rounded-md rounded-l-none border border-nero-600 text-sm focus:outline-none focus:ring-2 focus:ring-nero-500 z-10"
        />
      </div>

      <div className="w-full flex">
        <div className="w-[60%] h-8 flex items-center justify-center bg-nero-750 border border-nero-600 border-r-0 text-sm rounded-bl-md rounded-tl-md">
          Gap Y
        </div>

        <input
          type="number"
          value={gapYmm}
          onChange={(e) => handleGapYChange(e.target.value)}
          onFocus={(e) => e.target.select()}
          onBlur={(e) => {
            if (e.target.value === "") handleGapYChange("0");
          }}
          className="no-spinner w-[40%] h-8 px-2 py-1 bg-nero-700 rounded-md rounded-l-none border border-nero-600 text-sm focus:outline-none focus:ring-2 focus:ring-nero-500 z-10"
        />
      </div>
    </>
  );
};

export default GapInput;
