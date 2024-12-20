import { RoomsContext } from "contexts/RoomsContext";
import { useContext } from "react";

// Custom hook to use the UserContext
export const useRoomsContext = () => {
  const context = useContext(RoomsContext);
  if (!context) {
    throw new Error("useRoomsContext must be used within a UserProvider");
  }
  return context;
};
