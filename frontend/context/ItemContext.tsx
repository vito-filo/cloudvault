// context/ItemContext.tsx
import React, { createContext, useContext, useState } from "react";

type ItemContextType = {
  itemListRefresh: boolean;
  setItemListRefresh: (value: boolean) => void;
  gorupListRefresh: boolean;
  setGroupListRefresh: (value: boolean) => void;
};

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemProvider = ({ children }: { children: React.ReactNode }) => {
  const [itemListRefresh, setItemListRefresh] = useState(true);
  const [gorupListRefresh, setGroupListRefresh] = useState(true);

  return (
    <ItemContext.Provider
      value={{
        itemListRefresh,
        setItemListRefresh,
        gorupListRefresh,
        setGroupListRefresh,
      }}
    >
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
