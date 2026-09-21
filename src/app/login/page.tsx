import { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: { absolute: "Đăng nhập | CUONG DESIGN" },
  description: "Đăng nhập hệ thống quản trị Cường Design",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
