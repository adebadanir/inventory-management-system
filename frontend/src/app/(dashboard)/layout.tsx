"use client";
import React, { ReactNode } from "react";
import { Breadcrumb, Layout, theme } from "antd";
import Navbar from "@/components/navigation/Navbar";
import Sidebar from "@/components/navigation/Sidebar";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  children: ReactNode;
}

const { Content } = Layout;

function DashboardLayout(props: Props) {
  const { isLoading } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const pathName = usePathname().replace("/", "");

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <Layout className="h-screen w-screen">
      <Navbar />
      <Layout>
        <Sidebar />
        <Layout style={{ padding: "0 24px 24px" }}>
          <Breadcrumb
            items={[{ title: pathName }]}
            style={{
              margin: "16px 0",
              textTransform: "capitalize",
              fontWeight: "bold",
            }}
          />
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {props.children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default DashboardLayout;
