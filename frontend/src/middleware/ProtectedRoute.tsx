import { Navigate, Outlet } from "react-router";
import { useEffect, useState } from "react";
import customAxios from "../api/api";

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await customAxios.get("/auth/check-token"); // Panggil API backend
        setIsAuthenticated(true);
      } catch (error) {
        console.error(error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) return <p>Loading...</p>;

  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
