import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatWidget from "@/components/ui/ChatWidget";
import { siteConfig } from "@/data/site";
import { JsonLd, buildSitewideGraph } from "@/lib/seo";
import { prisma } from "@/lib/db";
import { SettingsProvider } from "@/components/ui/SettingsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.legalName}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.legalName,
    locale: siteConfig.locale,
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: siteConfig.defaultOG.width,
        height: siteConfig.defaultOG.height,
        alt: siteConfig.defaultOG.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch system configuration settings
  const dbSettings = await prisma.setting.findMany();
  const settings: Record<string, string> = {};
  dbSettings.forEach((s) => {
    settings[s.key] = s.value;
  });

  const primaryColor = settings.theme_primary_color || "#ec4899";
  const secondaryColor = settings.theme_secondary_color || "#8b5cf6";

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
        <SettingsProvider settings={settings}>
          <JsonLd data={buildSitewideGraph()} />
          {children}
          <ChatWidget />
        </SettingsProvider>
      </body>
    </html>
  );
}
