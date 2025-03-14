"use client";
import { signIn } from "@/services/auth/auth.service";
import "@ant-design/v5-patch-for-react-19";
import type { FormProps } from "antd";
import { Button, Form, Input } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FieldType = {
  email: string;
  password: string;
};

function LoginForm() {
  const router = useRouter();

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    setMsg("");
    setError("");
    try {
      const response = await signIn(values.email, values.password);
      if (response) {
        setMsg(response.message);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000 * 1);
      }
    } catch (error) {
      setError(error as string);
    }
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };
  return (
    <div className="w-full max-w-md p-4 border rounded-md border-gray-200">
      <h1 className="text-2xl text-center p-4 text-blue-600 font-semibold">
        Inventory Management System
      </h1>
      <Form
        name="login"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="Email"
          name="email"
          rules={[{ required: true, message: "Please input your email!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<FieldType>
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password />
        </Form.Item>
        <Link href={"/register"} className="text-xs flex justify-end pb-4">
          Create Account
        </Link>
        {msg && (
          <p className="text-green-500 w-full  rounded-sm bg-green-100 p-4 my-4">
            {msg}
          </p>
        )}
        {error && (
          <p className="text-red-500 w-full  rounded-sm bg-red-100 p-4 my-4">
            {error}
          </p>
        )}
        <Form.Item label={null} className="flex justify-center">
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default LoginForm;
