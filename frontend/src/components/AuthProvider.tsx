"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { usersApi } from "@/lib/api";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    usersApi
      .me()
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      })
      .finally(() => setLoading(false));
  }, [setUser, setLoading]);

  return <>{children}</>;
}
