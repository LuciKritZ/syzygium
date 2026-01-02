import React, { createContext, useContext, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Transport } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";

export type ServiceRegistry = Record<string, string>; // "package.name" -> "Base URL"

type TransportFactory = (serviceTypeName: string) => Transport;

const TransportContext = createContext<TransportFactory | null>(null);

export const useTransport = () => {
  const factory = useContext(TransportContext);
  if (!factory)
    throw new Error("useTransport must be used within SyzygyProvider");
  return factory;
};

interface SyzygyProviderProps {
  children: React.ReactNode;
  services: ServiceRegistry;
}

export const SyzygyProvider = ({ children, services }: SyzygyProviderProps) => {
  const queryClient = useRef(
    new QueryClient({
      defaultOptions: {
        queries: { staleTime: 5000, retry: 1, refetchOnWindowFocus: false },
      },
    })
  ).current;

  const transportsRef = useRef<Record<string, Transport>>({});

  const getTransport = (serviceTypeName: string): Transport => {
    // Logic: "infrastructure.v1.PingService" -> Match against registry keys
    const packageName = Object.keys(services).find((key) =>
      serviceTypeName.startsWith(key)
    );

    if (!packageName) {
      throw new Error(
        `[Syzygy] No URL configured for service: ${serviceTypeName}. Check your SyzygyProvider config.`
      );
    }

    const baseUrl = services[packageName];

    if (transportsRef.current[baseUrl]) {
      return transportsRef.current[baseUrl];
    }

    console.debug(
      `[Syzygy] Creating transport for ${packageName} -> ${baseUrl}`
    );
    const newTransport = createConnectTransport({ baseUrl });
    transportsRef.current[baseUrl] = newTransport;

    return newTransport;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TransportContext.Provider value={getTransport}>
        {children}
      </TransportContext.Provider>
    </QueryClientProvider>
  );
};
