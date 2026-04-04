import MarginInput from "./MarginInput";
import { useLayout } from "../../../context/LayoutProvider";
import { computeAutoMargins } from "../../../utils/computeAutoMargins";

const MarginConfigPanel = () => {
  const layout = useLayout();

  return (
    <div className="w-full flex flex-col p-2.5 border-b-2 bg-nero-800 border-nero-900">
      <div className="flex flex-col gap-2.5">
        <div className="w-full flex items-center justify-between">
          <h2 className="text-lg font-medium">Margin <span className="text-[11px]">(mm)</span></h2>

          <button
            onClick={() => {
              const { paperWidthPt, paperHeightPt, couponWidthPt, couponHeightPt } =
                layout.values;

              // turn off manual override
              layout.set.setUserMarginOverride(false);

              // if sizes are missing → reset margins to 0
              if (
                !paperWidthPt ||
                !paperHeightPt ||
                !couponWidthPt ||
                !couponHeightPt
              ) {
                layout.set.setTopMargin(0);
                layout.set.setBottomMargin(0);
                layout.set.setLeftMargin(0);
                layout.set.setRightMargin(0);
                return;
              }

              // else → calculate proper auto margins
              computeAutoMargins(layout);
            }}
            className="px-3 py-1 text-xs bg-nero-700 border border-nero-600 rounded-md hover:bg-nero-800 transition-all duration-200 ease-in-out"
          >
            Reset Margin
          </button>

        </div>

        <div className="w-full flex justify-start items-center gap-2">
          <MarginInput label="Top" />
          <MarginInput label="Bottom" />
          <MarginInput label="Left" />
          <MarginInput label="Right" />
        </div>
      </div>
    </div>
  );
};

export default MarginConfigPanel;
