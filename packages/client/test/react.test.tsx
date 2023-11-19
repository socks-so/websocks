import React from "react";
import { useState, useEffect } from "react";

import { Schema } from "./server";
import { createReactHooks } from "../src/react";
import { createClient } from "../src/standalone";

const { SocksProvider, useWebsocks } = createReactHooks<Schema>();

export const Main = () => {
  return (
    <SocksProvider client={createClient<Schema>("ws://localhost:3000")}>
      <TestComponent />
    </SocksProvider>
  );
};

export const TestComponent = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const client = useWebsocks();

  useEffect(() => {
    client.on.test(({ payload }) => {
      setMessages((msgs) => [...msgs, payload]);
    });
  }, [client]);

  return (
    <div>
      {messages.map((msg) => (
        <span>{msg}</span>
      ))}
      <button
        onClick={() => {
          client.send.test("Hi");
        }}
      >
        Send Test Messages
      </button>
    </div>
  );
};
