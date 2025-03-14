"use client";
import { Button, Input, Table, Tag } from "antd";
import { useRouter } from "next/navigation";

import { useState } from "react";
interface DataType {
  key: string;
  index: string;
  customer: string;
  poInCode: string;
  vendor: string;
  poOutCode: string;
  status: string;
}

const dataSource = [
  {
    key: "1",
    index: "1",
    customer: "PT. A",
    poInCode: "AB123",
    vendor: "PT. B",
    poOutCode: "CD456",
    status: "pending",
  },
  {
    key: "2",
    index: "2",
    customer: "PT. A",
    poInCode: "AB123",
    vendor: "PT. B",
    poOutCode: "ef123",
    status: "cancelled",
  },
  {
    key: "3",
    index: "3",
    customer: "PT. A",
    poInCode: "pl123",
    vendor: "PT. B",
    poOutCode: "CD456",
    status: "done",
  },
  {
    key: "4",
    index: "4",
    customer: "XYZ",
    poInCode: "AB123",
    vendor: "PT. z",
    poOutCode: "CD456",
    status: "done",
  },
];

function TransactionsTable() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  return (
    <>
      <div className="flex justify-between">
        <Input.Search
          placeholder="Search here..."
          className="mb-4 max-w-48"
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
        dataSource={dataSource}
        columns={[
          {
            title: "No",
            dataIndex: "index",
            key: "index",
          },
          {
            title: "Customer",
            dataIndex: "customer",
            key: "customer",
            filteredValue: search ? [search] : null,
            onFilter: (value, record: DataType) => {
              return (
                record.customer
                  ?.toLowerCase()
                  .replace(" ", "")
                  .includes((value as string).toLowerCase().replace(" ", "")) ||
                record.poInCode
                  ?.toLowerCase()
                  .replace(" ", "")
                  .includes((value as string).toLowerCase().replace(" ", "")) ||
                record.vendor
                  ?.toLowerCase()
                  .replace(" ", "")
                  .includes((value as string).toLowerCase().replace(" ", "")) ||
                record.poOutCode
                  ?.toLowerCase()
                  .replace(" ", "")
                  .includes((value as string).toLowerCase().replace(" ", "")) ||
                record.status
                  ?.toLowerCase()
                  .replace(" ", "")
                  .includes((value as string).toLowerCase().replace(" ", ""))
              );
            },
          },
          {
            title: "PO In Code",
            dataIndex: "poInCode",
            key: "poInCode",
            filteredValue: search ? [search] : null,
          },
          {
            title: "Vendor",
            dataIndex: "vendor",
            key: "vendor",
            filteredValue: search ? [search] : null,
          },
          {
            title: "PO Out Code",
            dataIndex: "poOutCode",
            key: "poOutCode",
            filteredValue: search ? [search] : null,
          },
          {
            title: "Status",
            dataIndex: "status",
            key: "status",
            filteredValue: search ? [search] : null,
            render: (status: string) => {
              let color = "";
              if (status === "cancelled") {
                color = "volcano";
              } else if (status === "pending") {
                color = "geekblue";
              } else if (status === "done") {
                color = "green";
              }
              return <Tag color={color}>{status.toUpperCase()}</Tag>;
            },
          },
        ]}
        pagination={{ position: ["bottomCenter"] }}
      />
    </>
  );
}

export default TransactionsTable;
