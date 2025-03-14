import { useState, useEffect } from "react";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}
export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          router.push("/login");
          return;
        }
        const res = await api.get("api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setUser(res.data);
      } catch {
        router.push("/login");
      }
    }
    fetchUser();
  }, [router]);
  return { user };
}
