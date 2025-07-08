"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/signin");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    // Optionally, return a spinner or skeleton here
    return null;
  }

  if (!user) {
    // While redirecting, render nothing
    return null;
  }

  return <>{children}</>;
} 