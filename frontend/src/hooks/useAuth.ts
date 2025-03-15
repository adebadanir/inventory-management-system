import { useState, useEffect } from "react";
import api from "@/utils/api";
import { usePathname, useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export function useAuth() {
  const router = useRouter();
  const pathName = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");

      // Halaman yang boleh diakses tanpa login
      const publicRoutes = ["/login", "/register", "/"];

      if (!token) {
        if (!publicRoutes.includes(pathName)) {
          router.push("/login");
        }
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get("api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setUser(res.data[0]);
        // Jika sudah login dan ada di halaman login, arahkan ke dashboard
        if (publicRoutes.includes(pathName)) {
          router.push("/dashboard");
        }
      } catch {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [router, pathName]);

  return { user, isLoading };
}
