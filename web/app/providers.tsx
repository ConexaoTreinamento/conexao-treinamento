"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/query-client"
import { ThemeProvider } from "next-themes"
import { Toaster as ShadcnToaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <ShadcnToaster />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
