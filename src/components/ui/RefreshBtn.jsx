import AutorenewIcon from "@mui/icons-material/Autorenew";
import { useRefresh } from "../../context/RefreshContext";

function RefreshBtn() {
  const { handleRefresh } = useRefresh();

  return (
    <button
      onClick={handleRefresh}
      className="group flex justify-center items-center w-full h-8 bg-nero-700 border border-nero-600 text-nero-100 font-bold rounded-md transition-all duration-200 focus:outline-none focus:ring-1 focus:border-nero-400"
    >
      <AutorenewIcon
        fontSize="small"
        className="text-nero-400 group-hover:text-nero-300 transition-colors duration-200"
      />
    </button>
  );
}

export default RefreshBtn;
