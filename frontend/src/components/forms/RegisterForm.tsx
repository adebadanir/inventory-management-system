"use client";
import "@ant-design/v5-patch-for-react-19";
import type { FormProps } from "antd";
import { Button, Form, Input } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { signUp } from "@/services/auth/auth.service";
import Link from "next/link";

type FieldType = {
  name: string;
  email: string;
  password: string;
  confPassword: string;
};

function RegisterForm() {
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();
  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    setMsg("");
    setError("");
    try {
      const response = await signUp(
        values.name,
        values.email,
        values.password,
        values.confPassword
      );
      if (response) {
        setMsg(response.message);
        setTimeout(() => {
          router.push("/login");
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
      <h1 className="text-2xl text-center p-4 text-blue-700 font-semibold">
        Create Account
      </h1>
      <Form
        name="register"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<FieldType>
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please input valid Email!" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item<FieldType>
          label="Password"
          name="password"
          rules={[
            { required: true, message: "Please input your password!" },
            { min: 8, message: "Password must be at least 8 characters" },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item<FieldType>
          label="Confirm Password"
          name="confPassword"
          rules={[
            { required: true, message: "Confirm Password cannot be empty!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject("Password does not match!");
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Link href={"/login"} className="text-xs flex justify-end pb-4">
          Already have an account?
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

        <Form.Item className="flex justify-center">
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default RegisterForm;
