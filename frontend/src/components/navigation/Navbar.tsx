"use client";
import { logout } from "@/services/auth/auth.service";
import "@ant-design/v5-patch-for-react-19";
import { Button } from "antd";
import { Header } from "antd/es/layout/layout";
import Image from "next/image";
import { useRouter } from "next/navigation";

function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <Header className="w-full flex items-center justify-between">
      <Image src="/logo.png" alt="logo" width={1} height={1} />
      <Button color="danger" variant="solid" onClick={handleLogout}>
        Logout
      </Button>
    </Header>
  );
}

export default Navbar;
