"use client";
import React from "react";
import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu, theme } from "antd";
import Link from "next/link";
import Sider from "antd/es/layout/Sider";

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  {
    key: "sub1",
    label: <Link href={"/dashboard"}>Dashboard</Link>,
    icon: <MailOutlined />,
  },
  {
    key: "sub2",
    label: <Link href={"/transactions"}>Transactions</Link>,
    icon: <AppstoreOutlined />,
  },
  {
    key: "sub3",
    label: <Link href={"/users"}>Users</Link>,
    icon: <AppstoreOutlined />,
  },
  {
    type: "divider",
  },
  {
    key: "sub4",
    label: "Navigation Three",
    icon: <SettingOutlined />,
    children: [
      { key: "9", label: "Option 9" },
      { key: "10", label: "Option 10" },
      { key: "11", label: "Option 11" },
      { key: "12", label: "Option 12" },
    ],
  },
  {
    key: "grp",
    label: "Group",
    type: "group",
    children: [
      { key: "13", label: "Option 13" },
      { key: "14", label: "Option 14" },
    ],
  },
];

function Sidebar() {
  const onClick: MenuProps["onClick"] = (e) => {
    console.log("click ", e);
  };
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  return (
    <Sider width={200} style={{ background: colorBgContainer }}>
      <Menu
        onClick={onClick}
        defaultSelectedKeys={["1"]}
        defaultOpenKeys={["sub1"]}
        mode="inline"
        items={items}
      />
    </Sider>
  );
}

export default Sidebar;
