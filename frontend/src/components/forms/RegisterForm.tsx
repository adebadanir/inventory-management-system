import type { FormProps } from "antd";
import { Button, Form, Input } from "antd";
import { signup } from "../../services/auth.service";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import axios from "axios";

type FieldType = {
  name: string;
  email: string;
  password: string;
  confPassword: string;
};

const RegisterForm = () => {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    setMsg("");
    setError("");

    const response = await signup(
      {
        name: values.name,
        email: values.email,
        password: values.password,
        confPassword: values.confPassword,
      },
      navigate
    );
    if (axios.isAxiosError(response)) {
      setError(response.response?.data.message);
    } else {
      const res = response as { code: number; message: string };
      if (res.code === 200) {
        setMsg(res.message);
      }
    }
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="w-96 p-4 border rounded-md border-gray-200 ">
      <h1 className="font-normal text-4xl p-4 flex w-full justify-center">
        Sign Up
      </h1>
      <Form
        name="registerForm"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please input your nae!" }]}
        >
          <Input />
        </Form.Item>
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
        <Form.Item<FieldType>
          label="Confirm Password"
          name="confPassword"
          rules={[
            { required: true, message: "Please input your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match!"));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Link to="/" className="w-full flex justify-end">
          Already have an account?
        </Link>

        <div className="my-2">
          {error && <p className="text-red-500 bg-red-100 p-4">{error}</p>}
          {msg && <p className="text-green-500 bg-green-100 p-4">{msg}</p>}
        </div>

        <Form.Item
          label={null}
          className="w-full flex justify-center items-center"
        >
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RegisterForm;
