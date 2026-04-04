import { useLayout } from "../../context/LayoutProvider";
import { useRefresh } from "../../context/RefreshContext";
import PresetPortraitImg from "../../assets/preset-portrait-img.svg";
import PresetLandscapeImg from "../../assets/preset-landscape-img.svg";
import { mmToPt } from "../../utils/unitConversion";

const PresetOption = ({ paperName, width, height, selected, onSelect }) => {
  const layout = useLayout();
  const { handleRefresh } = useRefresh();

  const applyPreset = () => {
    // UI knows preset is updating
    layout.set.setPresetUpdate(true);

    // force mm
    layout.set.setPaperUnit("mm");

    // assign paper size
    layout.set.setPaperWidthPt(mmToPt(width));
    layout.set.setPaperHeightPt(mmToPt(height));

    // full reset: trigger downstream state to refresh derived layouts
    handleRefresh();

    // ALSO reset coupon size UI values (if needed)
    layout.set.setUserMarginOverride(false);
  };

  const previewImg = width > height ? PresetLandscapeImg : PresetPortraitImg;

  return (
    <button
      onClick={() => {
        onSelect();
        applyPreset();
      }}
      className={`
    group
    w-full h-full flex flex-col items-center justify-center p-4 gap-4 rounded-md
    transition-colors duration-150 focus:outline-none
    ${selected
          ? "ring-3 ring-denim-600 ring-inset bg-[#2b2b2b]"
          : "bg-nero-800 hover:bg-[#2b2b2b] ring-0"
        }
  `}
    >
      <img
        src={previewImg}
        alt={`${paperName} preview`}
        className="w-24 h-24 rounded-md"
      />

      <span className="flex flex-col justify-center items-center text-sm font-semibold">
        <h4 className="text-base group-hover:text-denim-400 transition-colors duration-150">
          {paperName}
        </h4>
        <h4 className="font-medium">{`${width} x ${height} mm`}</h4>
      </span>
    </button>
  );
};

export default PresetOption;
