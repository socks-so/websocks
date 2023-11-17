import { createContext, useContext } from "react";
import {
  AnySocksType,
  DecorateReceiverMessageRecord,
  DecorateSenderMessageRecord,
} from "../types";

type ClientContext<TSocks extends AnySocksType> = {
  send: DecorateReceiverMessageRecord<TSocks["receiverMessages"]>;
  on: DecorateSenderMessageRecord<TSocks["senderMessages"]>;
};
const SocksContext = createContext<ClientContext<AnySocksType> | undefined>(
  undefined
);

export const SocksProvider = <TSocks extends AnySocksType>({
  children,
  client,
}: {
  children: React.ReactNode;
  client: ClientContext<TSocks>;
}) => {
  return (
    <SocksContext.Provider value={client}>{children}</SocksContext.Provider>
  );
};

export const useWebsocks = <TSocks extends AnySocksType>() => {
  const context = useContext(SocksContext);
  if (!context) {
    throw new Error("useWebsocks must be used within a SocksProvider");
  }
  return context as ClientContext<TSocks>;
};
