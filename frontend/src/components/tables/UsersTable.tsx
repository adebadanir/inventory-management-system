"use client";
import { Button, Input, Table } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

function UsersTable() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  return (
    <>
      <div className="flex justify-between">
        <Input.Search
          className="mb-4 max-w-48"
          placeholder="Search here..."
          onSearch={(value) => {
            setSearch(value);
          }}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        <Button
          color="primary"
          variant="solid"
          onClick={() => router.push("/transaction/create")}
        >
          Create
        </Button>
      </div>
      <Table
        pagination={{ position: ["bottomCenter"] }}
        columns={[
          {
            title: "No",
            dataIndex: "index",
            key: "index",
          },
          {
            title: "Name",
            dataIndex: "name",
            key: "name",
          },
          {
            title: "Email",
            dataIndex: "email",
            key: "email",
          },
          {
            title: "Role",
            dataIndex: "role",
            key: "role",
          },
          {
            title: "Actions",
          },
        ]}
      />
    </>
  );
}

export default UsersTable;
