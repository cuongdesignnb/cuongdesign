import React from "react";
import MenuManager from "./MenuManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Menu điều hướng | Admin Dashboard",
  description: "Trang thiết lập danh mục điều hướng chính đa cấp của website.",
};

export default function AdminMenuPage() {
  return <MenuManager />;
}
