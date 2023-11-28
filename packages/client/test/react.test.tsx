import React from "react";
import { useState, useEffect } from "react";

import { createReactHooks, createClient } from "../src/react";

import type { Schema } from "./server";

const { SocksProvider, useWebsocks } = createReactHooks(
  createClient<Schema>("ws://localhost:3000")
);

export const Main = () => {
  return (
    <SocksProvider>
      <TestComponent />
    </SocksProvider>
  );
};

export const TestComponent = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const client = useWebsocks();

  useEffect(() => {
    client.on.test((payload) => {
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
