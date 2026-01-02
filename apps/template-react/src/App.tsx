import { useState } from "react";
import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";

import { PingService } from "@syzygium/protos/gen/ts/infrastructure/v1/ping_pb";
import { SyzygyProvider } from "@syzygium/api";
import { SERVICES } from "./config/services";
import PingDemo from "./PingDemo";

const transport = createConnectTransport({
  baseUrl: "http://localhost:8090/api/infrastructure/v1",
});

const client = createClient(PingService, transport);

function App() {
  const [response, setResponse] = useState<string>("");

  const handlePing = async () => {
    try {
      const res = await client.ping({ message: "Hello from React!" });
      setResponse(`${res.message} (Server Time: ${res.serverTime})`);
    } catch (err) {
      console.error(err);
      setResponse("Error connecting to server");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Syzygium Test</h1>
      <button onClick={handlePing}>Send Ping to Go</button>
      <p>
        Server Says: <strong>{response}</strong>
      </p>

      <p>Using API hooks:</p>
      <SyzygyProvider services={SERVICES}>
        <PingDemo />
      </SyzygyProvider>
    </div>
  );
}

export default App;
