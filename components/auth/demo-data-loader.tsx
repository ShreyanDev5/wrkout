"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { getDemoWorkoutLogs } from "@/lib/demo-data";

export default function DemoDataLoader({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const supabase = createClientComponentClient();
  const hasRun = useRef(false);

  useEffect(() => {
    // Only run once, and only if user is loaded
    if (hasRun.current || isLoading || !user) return;
    hasRun.current = true;

    const checkAndInsertDemoData = async () => {
      // Check if user has any workout logs
      const { data: logs, error } = await supabase
        .from("workout_logs")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);
      if (error) return; // Optionally handle error
      if (logs && logs.length === 0) {
        // No logs: insert demo logs for this user
        const demoLogs = getDemoWorkoutLogs().map(log => ({
          ...log,
          user_id: user.id,
          id: undefined, // Let DB generate ID
          is_demo: true,
        }));
        await supabase.from("workout_logs").insert(demoLogs);
      }
    };
    checkAndInsertDemoData();
  }, [user, isLoading, supabase]);

  return <>{children}</>;
} 