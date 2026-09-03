import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import { getPublishedContent } from "@/lib/content/get-content";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Không tìm thấy trang",
};

export default async function NotFound() {
  const content = await getPublishedContent("system-copy");

  return (
    <div className="flex min-h-screen flex-col bg-[#030014] text-gray-200">
      <Header />
      <main className="flex grow items-center justify-center px-4 py-32 text-center">
        <div className="max-w-xl space-y-5">
          <p className="font-mono text-sm font-bold text-pink-500">404</p>
          <h1 className="text-4xl font-extrabold text-white">{content.notFound.title}</h1>
          <p className="text-gray-400">{content.notFound.description}</p>
          <Link href="/">
            <Button className="inline-flex items-center gap-2 bg-pink-600 text-white hover:bg-pink-500">
              <ArrowLeft className="h-4 w-4" />
              {content.notFound.actionLabel}
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
