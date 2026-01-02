import type { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createClient, ConnectError, type Client } from "@connectrpc/connect";
import type { DescService } from "@bufbuild/protobuf";
import { useTransport } from "./provider";

type RpcMethod<I, O> = (request: I, options?: any) => Promise<O>;

/**
 * 1. useRpc (Auto / Declarative)
 * - Runs on mount.
 * - Re-runs if input changes.
 */
export function useRpc<
  TService extends DescService,
  TInput extends object,
  TOutput extends object
>(
  service: TService,
  methodSelector: (client: Client<TService>) => RpcMethod<TInput, TOutput>,
  input: TInput,
  options?: Omit<UseQueryOptions<TOutput, ConnectError>, "queryKey" | "queryFn">
) {
  const getTransport = useTransport();
  const serviceName = service.typeName;

  return useQuery({
    queryKey: [serviceName, JSON.stringify(input)],
    queryFn: async () => {
      const transport = getTransport(serviceName);
      const client = createClient(service, transport);
      const method = methodSelector(client);
      return await method(input);
    },
    ...options,
  });
}

/**
 * 2. useAsyncRpc (Manual / Imperative)
 * - DOES NOT run on mount.
 * - Returns an 'execute' function that returns a Promise.
 */
export function useAsyncRpc<
  TService extends DescService,
  TInput extends object,
  TOutput extends object
>(
  service: TService,
  methodSelector: (client: Client<TService>) => RpcMethod<TInput, TOutput>,
  options?: Omit<UseQueryOptions<TOutput, ConnectError>, "queryKey" | "queryFn" | "enabled">
) {
  const getTransport = useTransport();
  const serviceName = (service as any).typeName;

  const query = useQuery({
    queryKey: [serviceName, "async"],
    queryFn: async ({ queryKey: _queryKey }) => {
      // Logic to actually fetch is handled by 'refetch', 
      // but React Query needs a valid fn here.
      // We essentially hijack the refetch mechanism.
      // *In standard React Query, you rely on refetch(), 
      // but passing arguments to refetch is tricky.*

      // TRICK: We return null here because we expect the user to use 
      // the mutation-style wrapper below if they want to pass dynamic args,
      // OR we just use refetch if the input is static.
      return null as unknown as TOutput;
    },
    enabled: false,
    ...options
  });

  const execute = async (input: TInput) => {
    const transport = getTransport(serviceName);
    const client = createClient(service as any, transport);
    const method = methodSelector(client);

    // We bypass the Query Cache for the fetch to ensure we get new data
    // and then manually set the cache if needed.
    const result = await method(input);
    return result;
  };

  return { ...query, execute };
}

/**
 * 3. useRpcMutation (Write)
 * - Standard mutation.
 */
export function useRpcMutation<
  TService extends DescService,
  TInput extends object,
  TOutput extends object
>(
  service: TService,
  methodSelector: (client: Client<TService>) => RpcMethod<TInput, TOutput>,
  options?: UseMutationOptions<TOutput, ConnectError, TInput>
) {
  const getTransport = useTransport();
  const serviceName = (service as any).typeName;

  return useMutation({
    mutationFn: async (variables: TInput) => {
      const transport = getTransport(serviceName);
      const client = createClient(service as any, transport);
      const method = methodSelector(client);
      return await method(variables);
    },
    ...options
  });
}
