import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const UnitSelector = ({ label = "Units", value, onChange }) => {
  return (
    <div className="w-[44%] flex flex-col gap-0.5">
      <label className="text-sm font-medium">{label}</label>

      <div className="relative w-full flex items-center">
        <select
          className="appearance-none w-full h-8 px-2 py-1 bg-nero-700 rounded-md border border-nero-600 text-[13px] text-nero-200 focus:outline-none focus:ring-2 focus:ring-nero-500 cursor-pointer"
          value={value}
          tabIndex={0}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="mm">Millimeter (mm)</option>
          <option value="in">Inches (in)</option>
        </select>

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-nero-300 text-xs">
          <KeyboardArrowDownIcon className="text-nero-400" />
        </span>
      </div>
    </div>
  );
};

export default UnitSelector;
