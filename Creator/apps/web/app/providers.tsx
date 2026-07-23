"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ReactNode, useState } from "react";

export const Providers = ({ children }: { children: ReactNode }) => {
  const [client] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </SessionProvider>
  );
};
