import { useState } from "react";
import { Form, Input, Button, Typography, Card, Alert, Space } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import type { User } from "../../types/chat";

const { Title, Text } = Typography;

interface Props {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form] = Form.useForm();

  const handleLogin = async (values: {
    username: string;
    password: string;
  }) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Xatolik yuz berdi");
      } else {
        onLogin(data.user);
      }
    } catch {
      setError("Server bilan ulanib bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f2f5",
      }}
    >
      <Card style={{ width: 380, borderRadius: 16 }} variant="borderless">
        <Space
          direction="vertical"
          size="small"
          style={{ width: "100%", marginBottom: 24 }}
        >
          <Title level={3} style={{ margin: 0, textAlign: "center" }}>
            Kirish
          </Title>
        </Space>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Foydalanuvchi nomini kiriting" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Parolni kiriting" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Parol"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
            >
              Kirish
            </Button>
          </Form.Item>
        </Form>

        <Text
          type="secondary"
          style={{ fontSize: 12, display: "block", textAlign: "center" }}
        >
          Foydalanuvchilar: ali, vali, salim, jasur, nozima
          <br />
          Parol: <Text strong>1234</Text>
        </Text>
      </Card>
    </div>
  );
}
