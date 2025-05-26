// context/ItemContext.tsx
import React, { createContext, useContext, useState } from "react";

type ItemContextType = {
  shouldRefresh: boolean;
  setShouldRefresh: (value: boolean) => void;
};

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemProvider = ({ children }: { children: React.ReactNode }) => {
  const [shouldRefresh, setShouldRefresh] = useState(false);

  return (
    <ItemContext.Provider value={{ shouldRefresh, setShouldRefresh }}>
      {children}
    </ItemContext.Provider>
  );
};

export const useItemContext = () => {
  const context = useContext(ItemContext);
  if (!context)
    throw new Error("useItemContext must be used within an ItemProvider");
  return context;
};
