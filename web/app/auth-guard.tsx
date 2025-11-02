"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (!storedToken || isTokenExpired(storedToken)) {
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        localStorage.removeItem("token");
        router.push("/");
        setChecking(false);
        return;
      }
      if (pathname === "/") {
        setChecking(false);
        return;
      }
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
      } else {
        setChecking(false);
      }
    }
  }, [router, pathname]);

  if (checking) {
    return null;
  }

  return <>{children}</>;
}

function isTokenExpired(token: string | null): boolean {
  if (!token) {
    return true;
  }
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    const exp = decoded.exp;
    if (!exp) {
      return true;
    }

    return exp < Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
}