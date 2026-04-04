import { useEffect, useMemo } from "react";
import RefreshBtn from "../ui/RefreshBtn";
import { useLayout } from "../../context/LayoutProvider";
import GapInput from "./GapInput";
import { useRefresh } from "../../context/RefreshContext";

const Orientation = () => {
  const {
    values: { paperWidthPt, paperHeightPt, orientation },
    set: { setPaperWidthPt, setPaperHeightPt, setOrientation }
  } = useLayout();

  const { handleRefresh } = useRefresh();

  useEffect(() => {
    if (!paperWidthPt || !paperHeightPt) return;

    if (paperWidthPt > paperHeightPt && orientation !== "landscape") {
      setOrientation("landscape");
      return;
    }

    if (paperHeightPt > paperWidthPt && orientation !== "portrait") {
      setOrientation("portrait");
    }
  }, [paperWidthPt, paperHeightPt, orientation, setOrientation]);

  const orientationOptions = useMemo(() => {
    if (paperWidthPt > paperHeightPt) {
      return [
        { value: "landscape", label: "Landscape" },
        { value: "portrait", label: "Portrait" },
      ];
    }

    if (paperHeightPt > paperWidthPt) {
      return [
        { value: "portrait", label: "Portrait" },
        { value: "landscape", label: "Landscape" },
      ];
    }

    return [
      { value: "portrait", label: "Portrait" },
      { value: "landscape", label: "Landscape" },
    ];
  }, [paperWidthPt, paperHeightPt]);

  // Swap width & height when orientation changes
  const handleOrientationChange = (value) => {
    // If user picks the same orientation → do nothing
    if (value === orientation) return;

    // Swap paper size
    setPaperWidthPt(paperHeightPt);
    setPaperHeightPt(paperWidthPt);

    // Update orientation state
    setOrientation(value);

    // Refresh everything (reset inputs, PDF regenerate, clear file input, etc.)
    handleRefresh();
  };

  return (
    <div className="w-full p-2.5 flex justify-center items-center gap-2 border-b-2 bg-nero-800 border-nero-900">
      <div className="w-[30%] flex">
        <select
          className="appearance-none w-full h-8 px-2 py-1 bg-nero-700 rounded-md border border-nero-600 text-sm text-nero-200 text-center focus:outline-none cursor-pointer"
          value={orientation}
          onChange={(e) => handleOrientationChange(e.target.value)}
        >
          {orientationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="w-[70%] h-8 flex gap-2">
        <GapInput />
      </div>

      <div className="w-[10%] h-8 flex">
        <RefreshBtn />
      </div>
    </div>
  );
};

export default Orientation;
