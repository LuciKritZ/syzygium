"use client";

import { useState } from "react";
import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";

import { PingService } from "@syzygium/protos/gen/ts/infrastructure/v1/ping_pb";

const transport = createConnectTransport({
  baseUrl: "http://localhost:8090/api/v1/infrastructure/v1",
});

const client = createClient(PingService, transport);

export default function Home() {
  const [response, setResponse] = useState<string>("");

  const handlePing = async () => {
    try {
      const res = await client.ping({ message: "Hello from Next.js!" });
      setResponse(`${res.message} (Server Time: ${res.serverTime})`);
    } catch (err) {
      console.error(err);
      setResponse("Error connecting to server");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white">
      <h1 className="text-4xl font-bold mb-8">Syzygium Next.js</h1>

      <button
        onClick={handlePing}
        className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition"
      >
        Send Ping to Go
      </button>

      <p className="mt-8 text-xl">
        Server Says:{" "}
        <span className="text-green-400 font-mono">{response}</span>
      </p>
    </div>
  );
}
