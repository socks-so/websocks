import { createContext, useContext } from "react";
import { AnySchema, Client } from "../types";

export const createReactHooks = <Schema extends AnySchema>(
  client: Client<Schema>
) => {
  const SocksContext = createContext<Client<Schema>>(client);

  return {
    SocksProvider: ({ children }: { children: React.ReactNode }) => {
      return (
        <SocksContext.Provider value={client}>{children}</SocksContext.Provider>
      );
    },

    useWebsocks: () => {
      return useContext(SocksContext);
    },
  };
};
