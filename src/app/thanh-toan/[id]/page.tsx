import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CheckoutClient from "./CheckoutClient";
import { Metadata } from "next";

interface CheckoutPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Thanh toán đơn hàng | CUONG DESIGN",
    description: "Trang thanh toán đơn hàng — Cuong Design",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { id } = await params;
  
  // Fetch order from DB
  const order = await prisma.order.findUnique({
    where: { id },
    include: { product: true },
  });

  if (!order) {
    notFound();
  }

  // Load banking settings from DB or fallback defaults
  const bankIdSetting = await prisma.setting.findUnique({ where: { key: "payment_bank_id" } });
  const bankAccountSetting = await prisma.setting.findUnique({ where: { key: "payment_bank_account" } });
  const bankNameSetting = await prisma.setting.findUnique({ where: { key: "payment_bank_name" } });

  const bankDetails = {
    bankId: bankIdSetting?.value || "MB", // MBBank
    accountNo: bankAccountSetting?.value || "0987654321", // Dummy MBBank Acc
    accountName: bankNameSetting?.value || "NGUYEN VAN CUONG",
  };

  return (
    <div className="min-h-screen bg-[#030014] text-gray-200 flex flex-col">
      <Header />
      
      <main className="grow py-24 flex items-center justify-center relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none select-none z-0" />
        
        <CheckoutClient 
          initialOrder={JSON.parse(JSON.stringify(order))} 
          bankDetails={bankDetails}
        />
      </main>

      <Footer />
    </div>
  );
}
