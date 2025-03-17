import { useNavigate } from "react-router";
import { me, logout } from "../services/auth.service";
import { useEffect } from "react";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const getMe = async () => {
      const response = await me();
      console.log(response);
    };
    getMe();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div>
      <button className="bg-red-500" onClick={handleLogout}>
        logout
      </button>
    </div>
  );
};

export default Dashboard;
