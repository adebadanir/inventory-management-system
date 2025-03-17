import type { FormProps } from "antd";
import { Button, Form, Input } from "antd";
import { login } from "../../services/auth.service";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import axios from "axios";

type FieldType = {
  email: string;
  password: string;
};

const LoginForm = () => {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    setMsg("");
    setError("");

    const response = await login(
      { email: values.email, password: values.password },
      navigate
    );
    if (axios.isAxiosError(response)) {
      setError(response.response?.data.message);
    }
    if (response.code === 200) {
      setMsg(response.message);
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
        Login
      </h1>
      <Form
        name="loginForm"
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
        <Link to="/register" className="w-full flex justify-end">
          Create Account
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

export default LoginForm;
