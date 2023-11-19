import { createContext, useContext } from "react";
import { AnySocksType, Client, InferTSocks } from "../types";

export const createReactHooks = <Schema extends AnySocksType>() => {
  const SocksContext = createContext<Client<Schema> | undefined>(undefined);

  return {
    SocksProvider: <Schema extends AnySocksType>({
      children,
      client,
    }: {
      children: React.ReactNode;
      client: Client<Schema>;
    }) => {
      return (
        <SocksContext.Provider value={client}>{children}</SocksContext.Provider>
      );
    },

    useWebsocks: () => {
      const context = useContext(SocksContext);
      if (!context) {
        throw new Error("useWebsocks must be used within a SocksProvider");
      }
      return context;
    },
  };
};
