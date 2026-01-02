import type { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { useQuery, useMutation } from "@tanstack/react-query";

type HttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

async function jsonFetcher<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`HTTP ${res.status}: ${errorBody || res.statusText}`);
  }
  // Handle empty responses (204)
  if (res.status === 204) return {} as T;
  return res.json();
}

// --- Hooks ---

/**
 * 1. useFetch (Auto / Read)
 * - Runs on mount.
 */
export function useFetch<T>(
  url: string,
  options?: Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: [url],
    queryFn: () => jsonFetcher<T>(url),
    ...options
  });
}

/**
 * 2. useAsyncFetch (Manual / Read)
 * - DOES NOT run on mount.
 * - Returns 'execute' which returns a Promise.
 */
export function useAsyncFetch<T>(
  url: string,
  options?: Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn" | "enabled">
) {
  const query = useQuery({
    queryKey: [url, "async"],
    queryFn: () => jsonFetcher<T>(url),
    enabled: false,
    ...options
  });

  const execute = async () => {
    return await jsonFetcher<T>(url);
  };

  return { ...query, execute };
}

/**
 * 3. useSend (Manual / Write)
 * - Used for POST/PUT/DELETE
 */
export function useSend<TData, TVariables>(
  url: string,
  method: HttpMethod = "POST",
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  return useMutation({
    mutationFn: (variables) => jsonFetcher<TData>(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(variables)
    }),
    ...options
  });
}
