import { useRefresh } from "../context/RefreshContext";
import SizeConfigPanel from "./panel/sizes/SizeConfigPanel";
import MarginConfigPanel from "./panel/margin/MarginConfigPanel";
import Orientation from "./ui/Orientation";
import GeneratePDF from "./GeneratePDF";

const Panel = () => {
  const { resetSignal } = useRefresh();

  return (
    <div className="w-full sm:w-[50%] md:w-[40%] lg:w-[33%] xl:w-[28%] h-screen bg-nero-800">
      <div className="w-full bg-nero-800 text-nero-300 text-xl px-4 py-2">
        Chronos Layout Planner
      </div>

      <div className="minimal-scrollbar scrollbar-hide sm:scrollbar-default overflow-y-auto overflow-x-hidden w-full h-[calc(100vh-44px)] flex flex-col justify-start items-center bg-nero-800 border-t-2 border-nero-900 text-nero-300">
        <SizeConfigPanel />
        <MarginConfigPanel />
        <Orientation />
        <GeneratePDF resetSignal={resetSignal} />
      </div>
    </div>
  );
};

export default Panel;
