import { useScanner } from "./ScannerContext";
import { toast } from "react-hot-toast";

export const useClearScan = () => {
  const { socket, scannerMode, setUniqueIdValue } = useScanner();

  const clearScan = () => {
    // Reset state
    setUniqueIdValue("");

    // Signal scanner to resume
    if (socket && scannerMode) {
      socket.emit("resume-scanning");
      toast.success("Ready for next scan");
    }
  };

  return clearScan;
};