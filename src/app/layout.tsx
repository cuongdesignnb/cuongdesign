import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatWidget from "@/components/ui/ChatWidget";
import DraftPreviewBanner from "@/components/admin/content/DraftPreviewBanner";
import { JsonLd, buildSitewideGraph, createSitewideMetadata } from "@/lib/seo";
import { prisma } from "@/lib/db";
import { getPublishedContent } from "@/lib/content/get-content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const global = await getPublishedContent("global");
  return {
    ...createSitewideMetadata({
      title: global.seo.title,
      titleTemplate: `%s | ${global.brand.legalName}`,
      description: global.seo.description,
      keywords: global.seo.keywords,
    }),
    icons: { icon: "/favicon.ico" },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const globalContentPromise = getPublishedContent("global");
  let dbSettings: Array<{ key: string; value: string }> = [];
  try {
    dbSettings = await prisma.setting.findMany({
      where: {
        key: { in: ["theme_primary_color", "theme_secondary_color"] },
      },
      select: { key: true, value: true },
    });
  } catch {
    console.warn("Database connection failed during build, using default settings.");
  }
  const settings: Record<string, string> = {};
  dbSettings.forEach((s) => {
    settings[s.key] = s.value;
  });

  const safeColor = (value: string | undefined, fallback: string) =>
    value && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
  const primaryColor = safeColor(settings.theme_primary_color, "#ec4899");
  const secondaryColor = safeColor(settings.theme_secondary_color, "#8b5cf6");
  const globalContent = await globalContentPromise;

  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --primary-color: ${primaryColor} !important;
                --secondary-color: ${secondaryColor} !important;
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <DraftPreviewBanner />
        <JsonLd data={buildSitewideGraph(globalContent)} />
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
