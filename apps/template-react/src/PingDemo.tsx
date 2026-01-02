import { useRpc, useAsyncRpc, useRpcMutation } from "@syzygium/api";
import { PingService } from "@syzygium/protos/gen/ts/infrastructure/v1/ping_pb";
import { useState } from "react";

const PingDemo = () => {
  const [dataOverridden, setDataOverridden] = useState(false);
  const { data, isLoading, error, refetch } = useRpc(
    PingService,
    (c) => c.ping,
    {
      message: "React Auto-Load",
    }
  );
  const lazy = useAsyncRpc(PingService, (c) => c.ping);
  const mutation = useRpcMutation(PingService, (c) => c.ping);

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error)
    return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <div style={{ paddingTop: "2rem", fontFamily: "sans-serif" }}>
      <h1>React + SDK Demo</h1>

      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => {
            refetch();
            setDataOverridden(true);
          }}
        >
          Trigger Refetch
        </button>
      </div>

      <div style={{ marginBottom: "1rem", padding: "1rem" }}>
        <h3>{dataOverridden ? "Refetched" : "Auto"} Data:</h3>
        <pre>{data?.message}</pre>
        <small>{data?.serverTime}</small>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={async () => {
            const res = await lazy.execute({ message: "Lazy Click" });
            alert(res.message);
          }}
        >
          Trigger Lazy Fetch
        </button>
      </div>

      <div>
        <button onClick={() => mutation.mutate({ message: "Mutation Write" })}>
          {mutation.isPending ? "Sending..." : "Trigger Mutation"}
        </button>
        {mutation.data && <p>Result: {mutation.data.message}</p>}
      </div>
    </div>
  );
};

export default PingDemo;
