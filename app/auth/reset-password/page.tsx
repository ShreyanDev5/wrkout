"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else {
      setMessage("Password updated! You can now sign in.");
      setTimeout(() => router.push("/auth/signin"), 2000);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-12 space-y-4">
      <h1 className="text-xl font-semibold mb-2">Reset your password</h1>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        placeholder="New password"
        className="w-full px-3 py-2 border rounded"
        disabled={loading}
      />
      <input
        type="password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        required
        placeholder="Confirm new password"
        className="w-full px-3 py-2 border rounded"
        disabled={loading}
      />
      <button type="submit" className="w-full bg-primary text-white py-2 rounded" disabled={loading}>
        {loading ? "Resetting..." : "Set New Password"}
      </button>
      {message && <div className="text-green-600 text-sm mt-2">{message}</div>}
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </form>
  );
} 