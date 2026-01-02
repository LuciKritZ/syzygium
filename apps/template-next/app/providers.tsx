"use client";

import { SyzygyProvider } from "@syzygium/api";

const SERVICES = {
  infrastructure: "http://localhost:8090/api/infrastructure/v1",
};

export function Providers({ children }: { children: React.ReactNode }) {
  return <SyzygyProvider services={SERVICES}>{children}</SyzygyProvider>;
}
